import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import { Users } from "./users.js";

type User = { id: number; username: string; }

type schemaType = {
  users: User[];
}

export class JsonUsers extends Users {
  private database: LowSync<schemaType>;

  constructor(usersList: User[] = []) {
    super(usersList);
    this.database = new LowSync(new JSONFileSync('./db/users.json'));
    this.database.read();

    if (this.database.data == null) {
      this.database.data = { users: [] };
      this.database.write();
    } else {
      this.database.data.users.forEach((user) => this.usersMap.set(user.id, user.username));
    }
  }

  addUser(username: string): number {
    const result = super.addUser(username);
    this.storeUsers();
    return result;
  }

  deleteUser(id: number): string {
    const username = super.deleteUser(id);
    this.storeUsers();
    return username;
  }

  storeUsers() {
    this.database.data.users = this.getUsers();
    this.database.write();
  }
}