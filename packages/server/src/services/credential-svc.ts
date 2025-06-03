// src/services/credential-svc.ts
import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";
import { Credential } from "../models/credential";

const credentialSchema = new Schema<Credential>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true 
    },
    hashedPassword: {
      type: String,
      required: true
    }
  },
  { collection: "user_credentials" }
);

const credentialModel = model<Credential>("Credential", credentialSchema);

function create(username: string, password: string): Promise<Credential> {
    return credentialModel
      .findOne({ username: username }) 
      .then((foundUser: Credential | null) => {
        if (foundUser) {
          throw new Error(`Username '${username}' already exists.`);
        }
        return bcrypt.genSalt(10); 
      })
      .then((salt: string) => bcrypt.hash(password, salt))
      .then((hashedPassword: string) => {
        const creds = new credentialModel({
          username,
          hashedPassword
        });
        return creds.save(); 
      });
}

function verify(username: string, password: string): Promise<string> {
  return credentialModel
    .findOne({ username: username }) 
    .then((foundCredential: Credential | null) => {
      if (!foundCredential) {
        throw new Error("Invalid username or password");
      }
      return bcrypt.compare(password, foundCredential.hashedPassword)
        .then((match: boolean) => {
          if (match) {
            return foundCredential.username; 
          } else {
            throw new Error("Invalid username or password");
          }
        });
    })
    .catch(error => { 
        throw new Error("Invalid username or password"); 
    });
}
export default { create, verify };