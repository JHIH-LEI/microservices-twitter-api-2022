import {
  SubscribeshipCreatedContent,
  SubscribeshipDeletedContent,
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
import { SubscribeshipCreatedPublisher } from "../publishers/subscribeship-created";
import { SubscribeshipDeletedPublisher } from "../publishers/subscribeship-deleted";

if (!process.env.MYSQL_URL) {
  throw new Error("MYSQL_URL env is required");
}

const sequelize = new Sequelize(process.env.MYSQL_URL);

class Subscribeship extends Model<
  InferAttributes<Subscribeship>,
  InferCreationAttributes<Subscribeship>
> {
  declare id: CreationOptional<number>;
  declare subscriberId: ForeignKey<string>;
  declare subscribingId: ForeignKey<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}
Subscribeship.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    hooks: {
      afterCreate: async (subscribeship, options) => {
        // date milliseconds will be round down in sql by default
        subscribeship.createdAt.setMilliseconds(0);
        const content: SubscribeshipCreatedContent = {
          subscriberId: subscribeship.subscriberId,
          subscribingId: subscribeship.subscribingId,
          // sql don't save precise milliseconds
          createdAt: subscribeship.createdAt.toISOString(),
        };
        await new SubscribeshipCreatedPublisher(connection).publish(content);
      },
      afterDestroy: async (subscribeship, options) => {
        const content: SubscribeshipDeletedContent = {
          subscriberId: subscribeship.subscriberId,
          subscribingId: subscribeship.subscribingId,
        };
        await new SubscribeshipDeletedPublisher(connection).publish(content);
      },
    },
    sequelize,
    tableName: "subscribeships",
  }
);

// ???????????????????????????????????????User?????????User???User server?????????
// ??????????????????user:created event???????????????????????????
// ???????????????server?????????????????????*id??????????????????*???
// ????????????sql??????????????????????????????
// ?????????????????????????????????
//(same user on different in two server's db
// nut never match bc id is diff)???
class User extends Model<
  InferAttributes<User, { omit: "subscribings" | "subscribers" }>,
  InferCreationAttributes<User>
> {
  declare id: string; // from user:created event
  declare createdAt: CreationOptional<Date>; // from user:created event
  declare updatedAt: CreationOptional<Date>; // from user:created event
  declare name: string;
  declare avatar: string;

  // pre-declare ????????? includes
  declare subscribers: NonAttribute<User[]>;
  declare subscribings: NonAttribute<User[]>;

  declare static associations: {
    subscribers: Association<User, User>;
    subscribings: Association<User, User>;
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
    },
    avatar: {
      type: DataTypes.STRING,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "users",
  }
);

// Here we associate which actually populates out pre-declared `association` static and other methods.

User.belongsToMany(User, {
  through: Subscribeship,
  foreignKey: "subscriberId",
  as: "Subscribings",
});

User.belongsToMany(User, {
  through: Subscribeship,
  foreignKey: "subscribingId",
  as: "Subscribers",
});

export const db = {
  sequelize,
  Sequelize,
  User,
  Subscribeship,
};
