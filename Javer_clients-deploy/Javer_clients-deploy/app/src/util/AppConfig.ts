export class AppConfig {
    static timezone: string = 'America/Monterrey';
    static version: string = '7.4.1.0';
    static desiredServerVersion: string = '7.4.1.0';

    static apiUrl: any = function () {
        return "https://crea-qa.javer.com.mx/api/";
    };

    static getApiUrlObject: any = function() {
      return new URL('', this.apiUrl());
    }

    static getServerVersion: any = function() {
      let obj = this.getApiUrlObject();
      // server_version / server_port
      // the server_version must be retrieved at the beginning of the session
      // from the "server/version" endpoint and saved to ionic storage, then
      // retrieved from storage and concatenated here
      let port = (obj.port.length ? obj.port : (obj.protocol == 'https:' ? '443' : '80'));
      let version = this.desiredServerVersion + '/' + port;
      return version;
    }
}
