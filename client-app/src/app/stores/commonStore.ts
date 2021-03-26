import { makeAutoObservable, reaction } from "mobx";
import { ServerError } from "../models/serverError";

export default class CommonStore {
    error: ServerError | null = null;
    token: string | null = window.localStorage.getItem('jwt');
    appLoaded = false;

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.token,
            token => {
                if (token) { 
                    this.addTokenToLocalStorage(token);
                } 
                else {
                    this.removeTokenFromLocalStorage();
                }
            }
        )
    }

    setServerError = (error: ServerError) => {
        this.error = error;
    }

    setToken = (token: string | null) => {
       this.token = token;
    }

    addTokenToLocalStorage = (token: string) => window.localStorage.setItem('jwt', token);
    removeTokenFromLocalStorage = () => window.localStorage.removeItem('jwt');

    setAppLoaded = () => {
        this.appLoaded = true;
    }
}
