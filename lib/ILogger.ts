export interface ILogger{
  info(message: string);
  warn(message: string);
  error(message: string);
}

export class DefaultLogger implements ILogger{

  info(message: string){
    console.log(message);
  }

  warn(message: string){
    console.error(message)
  }

  error(message: string){
    console.error(message)
  }

}
