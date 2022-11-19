import { DBError, ReplyCreatedContent } from "@domosideproject/twitter-common";
import { NextFunction, Request, Response } from "express";
import { Reply } from "../../models/reply";
import { ReplyCreatedPublisher } from "../../publishers/reply-created";
import { connection } from "../../app";
import { User } from "../../models/user";

type CreateReplyFromRequest = {
  comment: string;
};

export const newReply = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tweetId } = req.params;
    const userId = req.currentUser!.id;
    const { comment } = req.body as CreateReplyFromRequest;

    const reply = Reply.build({ tweetId, userId, comment });

    const [user] = await Promise.all([
      User.findById(userId),
      reply.save(),
    ]).catch((err) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    const content: ReplyCreatedContent = {
      id: reply.id,
      comment: reply.comment,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
      version: reply.version,
      tweetId: reply.tweetId.toHexString(),
      userId,
      avatar: user!.avatar,
    };

    await new ReplyCreatedPublisher(connection).publish(content);

    res.status(201).send({
      id: reply._id,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
