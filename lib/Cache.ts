import { S3 } from 'aws-sdk';
import { GetObjectRequest } from 'aws-sdk/clients/s3';
import { createReadStream, writeFile, promises, ReadStream } from 'fs';
import path from 'path';
import { EntsoeConfig } from './interfaces/entsoeCache';

export class EntsoeCache {

  static async write(data: Buffer, filename: string, config: EntsoeConfig): Promise<string|void> {
    if (config.awsBucket) {
      return this.writeAWS(data, filename, config);
    } else {
      this.writeFile(data, filename, config);
    }
  }
  static async read(fileName: string, config: EntsoeConfig, ETag?: string): Promise<any | undefined> {
    if (config.awsBucket) {
      try {
      return this.readAWS(fileName, config, ETag);
      } catch(e) {
        console.log(9999);
      }
    } else {
      return this.readFile(fileName, config, ETag);
    }
  }


  static async writeFile(data: Buffer, filename: string, config?: EntsoeConfig): Promise<void> {
    if (config?.cacheDir) {
      const fileName = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileDirName = path.join(config.cacheDir, fileName);
      writeFile(fileDirName, data, (e) => {
        if (e instanceof Error) {
          console.log(e.message);
        } else {
          console.log(e);
        }
        return;
      })
    }
  }

  static async readFile(fileName: string, config: EntsoeConfig, ETag?: string): Promise<ReadStream | undefined> {
    if (config.cacheDir) {
      const fileDirName = path.join(config.cacheDir, fileName);
      const stats = await promises.stat(fileDirName);
      const fileTime = (new Date(stats.mtime)).getTime() + '';

      if (fileTime === ETag) {
        return;
      }
      const stream = createReadStream(fileDirName)
      return stream;
    }
    throw new Error('no cache dir found')
  }



  static async writeAWS(data: Buffer, name: string, config: EntsoeConfig): Promise<string | undefined> {
    name = 'entsoeCache/' + name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    name = this.makeName(name);
    console.log(name);
    const params: any = {
      Bucket: config.awsBucket,
      Key: name,
      Body: data
    };
    const s3 = new S3();
    const uploadPromise = await s3.putObject(params).promise();
    return uploadPromise.ETag;
  }

  static readAWS(name: string, config: EntsoeConfig, eTag?: string): any | undefined {
    //name = 'entsoeCache/' + name;
    name = this.makeName(name);
    console.log('aws', name)
    const params: GetObjectRequest = {
      Bucket: config.awsBucket || '',
      Key: name,
      IfNoneMatch: eTag
    };

    const s3 = new S3();
    try {

      const stream = s3.getObject(params);
      return stream;
    } catch (e: any) {
      if (e.code === 'NotModified') {
        return;
      } else {
        console.log(e);
        throw e;
      }
    }
  }

  static makeName(name:string):string {
    return 'entsoeCache/' + name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }
}