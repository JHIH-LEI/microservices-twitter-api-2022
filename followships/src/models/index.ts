import {
  FollowshipCreatedContent,
  FollowshipDeletedContent,
  getDBUrlBaseNodeEnv,
} from "@domosideproject/twitter-common";
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes,
  Sequelize,
  NonAttribute,
  Association,
  ForeignKey,
} from "sequelize";
import { connection } from "../app";
import { FollowshipCreatedPublisher } from "../publishers/followship-created";
import { FollowshipDeletedPublisher } from "../publishers/followship-deleted";

const dbURL = getDBUrlBaseNodeEnv();
if (!dbURL) {
  throw new Error("missing dbURL env variable");
}

const sequelize = new Sequelize(dbURL);

class Followship extends Model<
  InferAttributes<Followship>,
  InferCreationAttributes<Followship>
> {
  declare id: CreationOptional<number>;
  declare followerId: ForeignKey<string>;
  declare followingId: ForeignKey<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}
Followship.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    followerId: {
      type: DataTypes.STRING,
      unique: "onlyFollowOnce",
    },
    followingId: {
      type: DataTypes.STRING,
      unique: "onlyFollowOnce",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    hooks: {
      afterCreate: async function (followship, option) {
        const followerId = followship.followerId;

        // set to sql time
        followship.createdAt.setMilliseconds(0);

        const content: FollowshipCreatedContent = {
          followerId,
          followingId: followship.followingId,
          createdAt: followship.createdAt.toISOString(),
        };
        await new FollowshipCreatedPublisher(connection).publish(content);
      },
      afterDestroy: async function (followship, option) {
        const content: FollowshipDeletedContent = {
          followerId: followship.followerId,
          followingId: followship.followingId,
        };
        await new FollowshipDeletedPublisher(connection).publish(content);
      },
    },
    sequelize,
    tableName: "followships",
  }
);

// 因為我們不會在裡面從頭創建User，創建User是User server做的，
// 我們只是接到user:created event然後把資料建進來，
// 意味著在此server創建使用者時，*id就應該被帶入*，
// 而不是讓sql幫我們生成一個新的。
// 這樣會讓我們資料不對稱
//(same user on different in two server's db
// nut never match bc id is diff)。
class User extends Model<
  InferAttributes<User, { omit: "followings" | "followers" }>,
  InferCreationAttributes<User>
> {
  declare id: string; // from user:created event
  declare name: string; // from user:created event
  declare avatar: string; // from user:created event
  declare account: string; // from user:created event
  declare createdAt: Date; // from user:created event
  declare updatedAt: Date; // from user:created event
  declare version: number; // from user:created event

  // pre-declare 潛在的 includes
  declare followers: NonAttribute<User[]>;
  declare followings: NonAttribute<User[]>;

  declare static associations: {
    followers: Association<User, User>;
    followings: Association<User, User>;
  };
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,

      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "users",
    hooks: {
      beforeSave: function (user, options) {
        const incomingVersion = user.dataValues.version;
        // @ts-ignore
        const preVersion = user._previousDataValues.version;

        if (user.isNewRecord) {
          user.version = 0;
          return;
        }

        if (incomingVersion !== preVersion + 1) {
          // 版本不符，還有其他版本要等，不許可這次更新

          throw new Error(
            `wrong user version:${incomingVersion}, should be: ${
              preVersion + 1
            }`
          );
        }
      },
    },
  }
);

// Here we associate which actually populates out pre-declared `association` static and other methods.

User.belongsToMany(User, {
  through: Followship,
  foreignKey: "followerId",
  as: "Followings",
});

User.belongsToMany(User, {
  through: Followship,
  foreignKey: "followingId",
  as: "Followers",
});

export const db = {
  sequelize,
  Sequelize,
  User,
  Followship,
};
