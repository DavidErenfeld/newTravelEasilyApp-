export interface IUser {
  _id?: string;
  email: string;
  password?: string;
  userName: string;
  imgUrl?: string;
  refreshTokens?: string[];
}
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export  class User extends BaseEntity  {
    @PrimaryGeneratedColumn("uuid")
    _id: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email: string;

    @Column({ type: "varchar", length: 255 })
    userName: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    password: string;

    @Column({ type: "varchar", nullable: true })
    imgUrl: string;

    @Column("simple-array", { nullable: true })
    refreshTokens: string[];

}
