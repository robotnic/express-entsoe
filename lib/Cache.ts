import { AWSError, S3 } from 'aws-sdk';
import { GetObjectRequest } from 'aws-sdk/clients/s3';
import { createReadStream, writeFile, promises, ReadStream } from 'fs';
import path from 'path';
import { EntsoeConfig } from './interfaces/entsoeCache';

export class EntsoeCache {

  static async write(data: Buffer, filename: string, config: EntsoeConfig): Promise<string | void> {
    if (config.awsBucket) {
      return this.writeAWS(data, filename, config);
    } else {
      this.writeFile(data, filename, config);
    }
  }
  static async read(fileName: string, config: EntsoeConfig, ETag?: string): Promise<any | undefined> {
    if (config.awsBucket) {
      return this.readAWS(fileName, config, ETag);
    } else {
      return this.readFile(fileName, config, ETag);
    }
  }


  static async writeFile(data: Buffer, filename: string, config?: EntsoeConfig): Promise<void> {
    if (config?.cacheDir) {
      //const fileName = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileDirName = path.join(config.cacheDir, filename);
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
      //      const fileDirName = path.join(config.cacheDir, fileName);
      const fileDirName = this.makeName(config.cacheDir, fileName);
      const stats = await promises.stat(fileDirName);
      const fileTime = (new Date(stats.mtime)).getTime() + '';

      if (fileTime === ETag) {
        return;
      }
      const stream = createReadStream(fileDirName);
      return stream;
    }
    throw new Error('no cache dir found')
  }



  static async writeAWS(data: Buffer, name: string, config: EntsoeConfig): Promise<string | undefined> {
    //    name = 'entsoeCache/' + name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    name = this.makeName(config.cacheDir, name);
    const params: any = {
      Bucket: config.awsBucket,
      Key: name,
      Body: data
    };
    const s3 = new S3();
    const uploadPromise = await s3.putObject(params).promise();
    return uploadPromise.ETag;
  }

  static readAWS(name: string, config: EntsoeConfig, eTag?: string): Promise<any | undefined> {
    //name = 'entsoeCache/' + name;
    name = this.makeName(config.cacheDir, name);
    const params: GetObjectRequest = {
      Bucket: config.awsBucket || '',
      Key: name,
      IfNoneMatch: eTag
    };

    const s3 = new S3();
    return new Promise((resolve, reject) => {
      s3.getObject(params, (error: AWSError, data: S3.GetObjectOutput) => {
        if (error) {
          if (error.code === 'NotModified') {
            reject(error)
          }
          reject(error);
        } else {
          resolve(data.Body);
        }
      })
    });
  }

  static makeName(cacheDir = '', name: string): string {
    return path.join(cacheDir, name.replace(/[^a-z0-9]/gi, '_').toLowerCase());
  }
}