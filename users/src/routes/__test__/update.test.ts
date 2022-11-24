import request from "supertest";
import { app } from "../../app";
import { User } from "../../models/user";

it.todo("add more update case");

it("update name and intro successful", async () => {
  const user = User.build({
    name: "test",
    email: "test@email.com",
    password: "12345662341",
    account: "user1",
  });
  await user.save();

  const newUser = await User.findOne({ email: "test@email.com" });

  expect(newUser).not.toBeNull();

  await request(app)
    .put(`/api/users/${newUser!.id}`)
    .set("Cookie", global.getCookie(newUser?.id))
    .send({ name: "updated", intro: "updated" })
    .expect(204);

  const updatedUser = await User.findById(newUser!.id);

  expect(updatedUser!.name).toBe("updated");

  expect(updatedUser!.intro).toBe("updated");
});

it("return 401 for trying to modify other file", async () => {
  const user = User.build({
    name: "test",
    email: "test@email.com",
    password: "12345662341",
    account: "user1",
  });
  await user.save();

  const newUser = await User.findOne({ email: "test@email.com" });

  expect(newUser).not.toBeNull();

  await request(app)
    .put(`/api/users/${newUser!.id}`)
    .send({ name: "updated", intro: "updated" })
    .expect(401);
});
