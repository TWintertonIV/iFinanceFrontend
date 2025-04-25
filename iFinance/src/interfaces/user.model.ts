export default interface UserModel {
    id: number;
    username: string;
    name: string;
    email: string;
    isAdmin: boolean;
    date_hired?: string;
    date_finished?: string;
    address: string;
    user_type?: string;
    dateHired?: string;
    dateFinished?: string;
    is_admin?: boolean;

}