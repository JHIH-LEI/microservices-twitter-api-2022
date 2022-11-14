import { SubscribeshipCreatedContent } from "@domosideproject/twitter-common";
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

let dbURL = "";
switch (process.env.NODE_ENV) {
  case "dev": {
    if (!process.env.DEV_DB_URL) {
      throw new Error("missing DEV_DB_URL env variable");
    }
    dbURL = process.env.DEV_DB_URL;
    break;
  }
  case "prod": {
    if (!process.env.PROD_DB_URL) {
      throw new Error("missing PROD_DB_URL env variable");
    }
    dbURL = process.env.PROD_DB_URL;
    break;
  }
  case "test": {
    if (!process.env.TEST_DB_URL) {
      throw new Error("missing TEST_DB_URL env variable");
    }
    dbURL = process.env.TEST_DB_URL;
    break;
  }
}

const sequelize = new Sequelize(dbURL);

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
        const subscriber = await User.findByPk(subscribeship.subscriberId);
        if (subscriber === null) {
          return;
        }
        // date milliseconds will be round down in sql by default
        subscribeship.createdAt.setMilliseconds(0);
        const content: SubscribeshipCreatedContent = {
          subscriberId: subscribeship.subscriberId,
          subscribingId: subscribeship.subscribingId,
          // sql don't save precise milliseconds
          createdAt: subscribeship.createdAt.toISOString(),
          name: subscriber.name,
          avatar: subscriber.avatar,
        };
        await new SubscribeshipCreatedPublisher(connection).publish(content);
      },
    },
    sequelize,
    tableName: "subscribeships",
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
  InferAttributes<User, { omit: "subscribings" | "subscribers" }>,
  InferCreationAttributes<User>
> {
  declare id: string; // from user:created event
  declare createdAt: CreationOptional<Date>; // from user:created event
  declare updatedAt: CreationOptional<Date>; // from user:created event
  declare name: string;
  declare avatar: string;

  // pre-declare 潛在的 includes
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
