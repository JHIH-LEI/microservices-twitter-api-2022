import { Connection, Channel } from "amqplib";
import {
  NotificationCreatedContent,
  NotificationType,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import mongoose from "mongoose";
import { io as Client, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Notification, NotificationAttrs } from "../../models/notification";
import { User } from "../../models/user";
import { io as serverSocket } from "../../index";
import { RedisOperator } from "../../services/redis-operator";
import { NotifyPopupContent } from "../../types";
import { NotificationCreatedConsumer } from "../notification-created";

type NotificationDataInDB = NotificationAttrs & {
  _id: mongoose.Types.ObjectId;
  __v: number;
};

// consume行為正常
// 根據notifyIds去redis找到相應的socketIds
// 找到觸發者的name, avatar
// 成功emit帶有正確格式的資料給正確的使用者（多個連線4個連線, 2個連線來自user1, 1個連線來自user2, 1個連線來自user3，除了user3之外其他都要被通知。）

jest.setTimeout(12000);

// mock掉不相關的event免得互相干擾，裡面會mock io.to.emit，若沒有把其他也會emit的事件mock掉（不執行），就會造成預期錯誤。
// 舉例來說：這邊其中一個測試看notification-created有無正確emit notify event 給特定socketId，這時會去看spyOn的io.to.emit呼叫的次數，若此時沒有先mock掉其他也會io.to.emit的event，則其他不相關的event呼叫次數也會被紀錄，造成每次有新的event都要更新這份測試檔。這也是為啥要把event都包成一個function，便於測試時mock掉不相關的event。

// 但麻煩的事，每多一個事件，都要去每個其他不相關的event測試檔mock他

jest.mock("../../events/emit/notificationCounts");

describe("notification-created", () => {
  let clientSocketFromUser2: Socket<DefaultEventsMap, DefaultEventsMap>;
  let clientSocketFromUser3: Socket<DefaultEventsMap, DefaultEventsMap>;
  let clientSocketFromUserNotToNotify: Socket<
    DefaultEventsMap,
    DefaultEventsMap
  >;

  const triggerId = new mongoose.Types.ObjectId();
  const twitterId = new mongoose.Types.ObjectId().toHexString();

  // user need to be notify
  const user2Id = new mongoose.Types.ObjectId();
  const user3Id = new mongoose.Types.ObjectId();
  // user do not be notify
  const user4NotToNotifyId = new mongoose.Types.ObjectId();

  const createdAt = new Date();
  const main = "newTweet";

  const content: NotificationCreatedContent = {
    id: twitterId,
    userId: triggerId.toHexString(),
    notifyUserIds: [user2Id.toHexString(), user3Id.toHexString()],
    createdAt: createdAt.toISOString(),
    main,
    type: NotificationType.Tweet,
  };

  const mockIoToEmit = jest
    .fn()
    .mockImplementation((event: string, content: any) => {
      console.log(`io.to()emit(${event}, ${content})`);
    });
  // @ts-ignore
  jest.spyOn(serverSocket, "to").mockImplementation((room: string) => {
    return {
      emit: mockIoToEmit,
    };
  });
  // @ts-ignore
  const message = {} as Message;

  // user2, user3, user4 connected
  beforeAll((done) => {
    clientSocketFromUser2 = Client("http://localhost:3000", {
      auth: {
        token: global.getToken(user2Id),
      },
    });

    clientSocketFromUser3 = Client("http://localhost:3000", {
      auth: {
        token: global.getToken(user3Id),
      },
    });

    clientSocketFromUserNotToNotify = Client("http://localhost:3000", {
      auth: {
        token: global.getToken(user4NotToNotifyId),
      },
    });

    clientSocketFromUser2.on("connect", () => {
      console.log("client know user2 connect");
      done();
    });
    clientSocketFromUser3.on("connect", () => {
      console.log("client know user3 connect");
      done();
    });
    clientSocketFromUserNotToNotify.on("connect", () => {
      console.log("client know user4 connect");
      done();
    });
  });

  test("save notification in DB and send io.to(notifyUserSocketId).emit('notify',notificationContent)", async () => {
    // setup
    const triggerUser = await saveTriggerUserInDB(triggerId);

    // it contain 2 user (user2, user3) should be notify

    // @ts-ignore
    const connection = {} as Connection;
    // @ts-ignore
    const channel = {} as Channel;

    await new NotificationCreatedConsumer(connection, channel).consumeCallBack(
      content,
      message
    );

    // 發通知後，資料庫中應該要有被通知者user2,user3的通知紀錄
    const [
      user2NotificationInDB,
      user3NotificationInDB,
      notNotifyUserNotificationInDB,
    ] = await Promise.all([
      Notification.findOne({
        receiverId: user2Id,
      }),
      Notification.findOne({
        receiverId: user3Id,
      }),
      Notification.findOne({
        receiverId: user4NotToNotifyId,
      }),
    ]);

    const expectNotificationDataForUser2InDB: NotificationDataInDB = {
      _id: user2NotificationInDB!._id,
      id: new mongoose.Types.ObjectId(twitterId),
      main,
      type: NotificationType.Tweet,
      isRead: false,
      createdAt,
      triggerId,
      receiverId: user2Id,
      __v: 0,
    };
    const expectNotificationDataForUser3InDB: NotificationDataInDB = {
      _id: user3NotificationInDB!._id,
      id: new mongoose.Types.ObjectId(twitterId),
      main,
      type: NotificationType.Tweet,
      isRead: false,
      createdAt,
      triggerId,
      receiverId: user3Id,
      __v: 0,
    };

    expect(notNotifyUserNotificationInDB).toBeNull();
    expect(user2NotificationInDB!.toObject()).toEqual(
      expectNotificationDataForUser2InDB
    );
    expect(user3NotificationInDB!.toObject()).toEqual(
      expectNotificationDataForUser3InDB
    );

    // socket.io test io.to(socketId).emit()
    const mockIoTo = serverSocket.to as jest.Mock;

    // redis 找user2, user3 socketIds. user4
    // 通知對象只有user2, user3，沒有user4
    // 應只有user2,user3的socketIds被通知
    const [user2Sockets, user3Sockets, user4NotToNotifySockets] =
      await Promise.all([
        RedisOperator.getNotifyUserSocketIds(user2Id.toHexString()),
        RedisOperator.getNotifyUserSocketIds(user3Id.toHexString()),
        RedisOperator.getNotifyUserSocketIds(user4NotToNotifyId.toHexString()),
      ]);

    expect(user2Sockets.length).toBe(1);
    expect(user3Sockets.length).toBe(1);
    expect(user4NotToNotifySockets.length).toBe(1);

    /**
     * test io.*to(socketId)*.emit("notify",
     * notifyContent)
     *
     * should send to user2, user3 (base on
     * notifyIds in notification:created return
     * message) sockets (it will save in redis
     * key:userId value: socket set).
     */

    expect(mockIoTo).toBeCalledTimes(user2Sockets.length + user3Sockets.length);
    // test if io.to user2 socket
    expect(mockIoTo.mock.calls[0][0]).toEqual(user2Sockets[0]);
    // test if io.to user3 socket
    expect(mockIoTo.mock.calls[1][0]).toEqual(user3Sockets[0]);

    // test io.to(socket).*emit*

    const emitNotification: NotifyPopupContent = {
      id: twitterId,
      main,
      type: NotificationType.Tweet,
      createdAt: createdAt.toISOString(),
      name: triggerUser.name,
      avatar: triggerUser.avatar,
      userId: triggerId.toHexString(),
    };
    expect(mockIoToEmit).toBeCalledTimes(
      user2Sockets.length + user3Sockets.length
    );

    // test io.to(user2Socket)."emit(*event*,message)"
    expect(mockIoToEmit.mock.calls[0][0]).toBe("notify");
    // test io.to(user2Socket)."emit(event,*message*)"
    expect(mockIoToEmit.mock.calls[0][1]).toEqual(emitNotification);

    // test io.to(user3Socket)."emit(*event*,message)"
    expect(mockIoToEmit.mock.calls[1][0]).toBe("notify");
    // test io.to(user3Socket)."emit(event,*message*)"
    expect(mockIoToEmit.mock.calls[1][1]).toEqual(emitNotification);
  });

  afterAll(async () => {
    console.log("socket close");
    serverSocket.close();
    clientSocketFromUser2.close();
    clientSocketFromUser3.close();
    clientSocketFromUserNotToNotify.close();
  });
});

const saveTriggerUserInDB = async (triggerId: mongoose.Types.ObjectId) => {
  const triggerUser = User.build({
    _id: triggerId,
    name: "user1",
    avatar: "avatar",
    version: 0,
  });

  await triggerUser.save().catch((err) => console.log(err));

  return triggerUser;
};
