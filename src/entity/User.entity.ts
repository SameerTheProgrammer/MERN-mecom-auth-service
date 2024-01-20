import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ type: "varchar", default: "customer" })
    role: string;

    @Column({ type: "int", nullable: true })
    phoneNumber: number;

    // @Column({ type: "jsonb" })
    // Number: {
    //     countryCode:string,
    //     nationalNumber: string
    // };

    @Column({ type: "jsonb", nullable: true })
    avatar: {
        public_id: string;
        url: string;
    };

    @BeforeInsert()
    @BeforeUpdate()
    updateEmail() {
        if (this.email) {
            this.email = this.email.toLowerCase();
        }
    }
}
