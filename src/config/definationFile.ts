import { Request } from "express"

interface DecodedToken {
    id : number,
    email : string;
}

export interface IGetUserAuthInfoRequest extends Request {
  user: DecodedToken
}
