import fs from 'fs';

type User = {
  id: number;
  username: string;
}

export class Users {
  protected usersMap = new Map<number, string>();
  private nextId: number = 1;

  constructor(public usersList: User[] = []) {
    this.usersList.forEach((user) => this.usersMap.set(user.id, user.username));
  }

  addUser(username: string): number {
    while(this.getUsernameById(this.nextId)) {
      this.nextId += 1;
    }
    this.usersMap.set(this.nextId, username.trim().toLowerCase());
    return this.nextId;
  }

  hasUser(username: string): boolean {
    return [...this.usersMap.values()].includes(username.trim().toLowerCase());
  }

  getUsersCount(): number {
    return this.usersMap.size;
  }

  getUsernames(): string[] {
    return [...this.usersMap.values()];
  }

  getUsers(): User[] {
    const userEntries = [...this.usersMap.entries()];
    const users = userEntries.map(([id, username]) => ({ id, username }));
    return users;
  }

  getUsernameById(id: number): string {
    return this.usersMap.get(id);
  }

  deleteUser(id: number): string {
    const username = this.getUsernameById(id);
    this.usersMap.delete(id);
    return username;
  }

  deleteUserDatabase(username) {
    fs.unlink(`${process.cwd()}/db/${username}.json`, (err) => {
      if (err) {
        console.error(`Error removing file: ${err}`);
      }
    });
  }
}