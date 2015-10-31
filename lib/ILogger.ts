export interface ILogger{
  info(message: string, ...params: any[]);
  warn(message: string, ...params: any[]);
  error(message: string, ...params: any[]);
}

export class DefaultLogger implements ILogger{

  info(message: string, ...params: any[]){
    console.log(message, params);
  }

  warn(message: string, ...params: any[]){
    console.error(message, params)
  }

  error(message: string, ...params: any[]){
    console.error(message, params)
  }

}
