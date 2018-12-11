interface IConfig {
    orgs: Array<IPopulateValue>;
}

interface IPopulateValue {
    name: string;
    admins: Array<IPerson>;
    users: Array<IPerson>;
}

interface IPerson {
    name: string;
    email: string;
}
