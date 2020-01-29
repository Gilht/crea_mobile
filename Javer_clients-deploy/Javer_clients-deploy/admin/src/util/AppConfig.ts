export class AppConfig {
    static apiUrl: any = function () {
        return window.location.protocol + "//" + window.location.host + "/api/";
    };
    static timezone: string = 'America/Monterrey';
    static version: string = '7.4.1.0';
    static desiredServerVersion: string = '7.4.1.0';
}
