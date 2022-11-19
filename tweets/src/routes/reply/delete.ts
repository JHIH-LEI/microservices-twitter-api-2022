import { Request, Response } from "express";
import { DBError, ConflictError } from "@domosideproject/twitter-common";
import { Reply } from "../../models/reply";

export const deleteReply = async (req: Request, res: Response) => {
  const { replyId } = req.params;
  const loginUserId = req.currentUser?.id;

  const reply = await Reply.findOne({ userId: loginUserId, replyId }).catch(
    (err) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    }
  );

  if (reply === null) {
    throw new ConflictError("reply not exist");
  }

  await reply.remove();
  res.status(204).send("ok");
};
