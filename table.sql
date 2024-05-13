create table user(
    id int primary key AUTO_INCREMENT,
    name varchar(250),
    contact varchar(15),
    email varchar(50),
    password varchar(250),
    status varchar(20),
    role varchar(20),
    UNIQUE (email)
);

insert into user(name,contact,email,password,status,role) values ('Admin','9867543212','admin@gamil.com','admin@123','true','admin');

create table category(
    id int NOT NULL AUTO_INCREMENT,
    name varchar(250) NOT NULL,
    primary key(id)
);

create table product(
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    categoryId integer NOT NULL,
    description varchar(255),
    price integer,
    status varchar(20),
    primary key(id)
);

create table bill(
    id int NOT NULL AUTO_INCREMENT,
    uuid varchar(200) NOT NULL,
    name varchar(255) NOT Null,
    email varchar(255) NOT NULL,
    contact varchar(20) NOT NULL,
    paymentMethod varchar(50) NOT NUll,
    total int NOT Null,
    productDetails JSON DEFAULT NUll,
    createdBy varchar(255) NOT NULL,
    primary key(id)
);