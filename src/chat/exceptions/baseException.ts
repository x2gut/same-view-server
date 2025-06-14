interface ChatErrorSerializable {
  toErrorResponse(): {
    errorType: string;
    message: string;
  };
}

export abstract class BaseException
  extends Error
  implements ChatErrorSerializable
{
  abstract toErrorResponse(): {
    errorType: string;
    message: string;
  };
}
