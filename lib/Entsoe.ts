import * as express from 'express'
import { InputError, UpstreamError } from './Errors';
import { Loader } from './Loader';
import { CreateSwagger } from './Swagger';
import { gzip } from 'zlib';
import { Datevalidator } from './Datevalidator';
import { ChartGroup } from './interfaces/charts';
import { EntsoeCache } from './Cache';
import { EntsoeConfig } from './interfaces/entsoeCache';
import { ConfigurationOptions, config } from 'aws-sdk';
import axios from 'axios';


export class Entsoe {
  static init(entsoeConfig: EntsoeConfig): express.Router {

    let entsoeDomain = 'https://transparency.entsoe.eu';
    let basePath = '/entsoe';
    let maxAge = 3600;

    if (entsoeConfig.basePath) {
      basePath = entsoeConfig.basePath;
    }
    if (entsoeConfig.maxAge) {
      maxAge = entsoeConfig.maxAge;
    }
    if (entsoeConfig.entsoeDomain) {
      entsoeDomain = entsoeConfig.entsoeDomain;
    }
    const awsConfig: ConfigurationOptions = {
      secretAccessKey: entsoeConfig.awsSecretAccessKey,
      accessKeyId: entsoeConfig.awsAccessKeyId,
      region: 'eu-central-1'
    }
    delete entsoeConfig.awsAccessKeyId;
    delete entsoeConfig.awsSecretAccessKey;
    config.update(awsConfig);

    const loader = new Loader(entsoeConfig.securityToken, entsoeDomain);
    const router = express.Router();



    router.use(async (req, res, next) => {
      if (req.headers?.refresh === 'true') {
        next()
      } else {
        const fileName = req.url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        try {
          const ETag = req.headers['if-none-match'];
          const stream = await EntsoeCache.read(fileName, entsoeConfig, ETag);
          if (!stream) {
            res.set('etag', ETag);
            return res.sendStatus(304);
          } else {
            res.set('Cache-Control', `public, max-age=${maxAge}`);
            res.set('content-type', 'application/json');
            res.set('content-encoding', 'gzip');
            if (stream.Body) {
              res.set('etag', stream.ETag);
              res.end(stream.Body, 'binary')
            } else {
              res.set('etag', stream.ETag);
              stream.file.pipe(res);
            }
          }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          if (e.code !== 'NotModified') {
            //console.log('e1', e)
            next();
          } else {
            const ETag = req.headers['if-none-match'];
            res.set('etag', ETag);
            res.set('Cache-Control', `public, max-age=${maxAge}`);
            res.sendStatus(304)
          }
        }
      }
    });



    router.get(`${basePath}/:country/installed`, async (req, res) => {
      const country = req.params.country;
      try {
        const [periodStart, periodEnd] = Datevalidator.getYear(req.query);
        const data = await loader.getInstalled(country, periodStart, periodEnd);
        this.cacheAndSend(req, res, data, entsoeConfig);
      } catch (e: unknown) {
        if (e instanceof Error) {
          this.errorHandler(res, e);
        }
      }
    })

    router.get(`${basePath}/:country/generation`, async (req, res) => {
      const country = req.params.country;
      let psrType: string | undefined
      if (typeof (req.query.psrType) === 'string') {
        psrType = req.query.psrType;
      }
      try {
        const [periodStart, periodEnd] = Datevalidator.getStartEnd(req.query);
        const data = await loader.getEntsoeData(country, 'generation', periodStart, periodEnd, psrType);
        this.cacheAndSend(req, res, data, entsoeConfig);
      } catch (e: unknown) {
        if (e instanceof Error) {
          this.errorHandler(res, e);
        }
      }
    })

    router.get(`${basePath}/:country/generation_per_plant`, async (req, res) => {
      const country = req.params.country;
      let psrType: string | undefined
      if (typeof (req.query.psrType) === 'string') {
        psrType = req.query.psrType;
      }
      try {
        const [periodStart, periodEnd] = Datevalidator.getStartEnd(req.query);
        const data = await loader.getEntsoeData(country, 'generation_per_plant', periodStart, periodEnd, psrType);
        this.cacheAndSend(req, res, data, entsoeConfig);
      } catch (e: unknown) {
        if (e instanceof Error) {
          this.errorHandler(res, e);
        }
      }
    })


    router.get(`${basePath}/:country/prices`, async (req, res) => {
      const country = req.params.country;
      try {
        const [periodStart, periodEnd] = Datevalidator.getStartEnd(req.query);
        const data = await loader.getEntsoeData(country, 'prices', periodStart, periodEnd);
        this.cacheAndSend(req, res, data, entsoeConfig);
      } catch (e: unknown) {
        if (e instanceof Error) {
          this.errorHandler(res, e);
        }
      }
    })

    router.get(`${basePath}/:country/hydrofill`, async (req, res) => {
      const country = req.params.country;
      try {
        const [periodStart, periodEnd] = Datevalidator.getStartEnd(req.query);
        const data = await loader.getEntsoeData(country, 'hydrofill', periodStart, periodEnd);
        this.cacheAndSend(req, res, data, entsoeConfig);
      } catch (e: unknown) {
        if (e instanceof Error) {
          this.errorHandler(res, e);
        }
      }
    })

    router.get(`${basePath}/:country/load`, async (req, res) => {
      const country = req.params.country;
      try {
        const [periodStart, periodEnd] = Datevalidator.getStartEnd(req.query);
        const data = await loader.getEntsoeData(country, 'load', periodStart, periodEnd);
        this.cacheAndSend(req, res, data, entsoeConfig);
      } catch (e: unknown) {
        if (e instanceof Error) {
          this.errorHandler(res, e);
        }
      }
    })

    router.get(`${basePath}/datalists/countries`, async (req, res) => {
      try {
        const data = await loader.getCountries();
        res.set('Cache-Control', 'public, max-age=31536000');
        res.send(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          this.errorHandler(res, e);
        }
      }
    })

    router.get(`${basePath}/datalists/psrtypes`, async (req, res) => {
      try {
        const data = await loader.getPsrTypes();
        res.set('Cache-Control', 'public, max-age=31536000');
        res.send(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          this.errorHandler(res, e);
        }
      }
    })


    router.get(`${basePath}`, async (req, res) => {
      try {
        const data = await CreateSwagger.load(basePath);
        res.set('Cache-Control', 'public, max-age=31536000');
        res.send(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          this.errorHandler(res, e);
        }
      }
    })

    return router;
  }

  private static cacheAndSend(req: express.Request, res: express.Response, data: ChartGroup, config: EntsoeConfig): void {
    const buf = Buffer.from(JSON.stringify(data), 'utf-8');
    gzip(buf, async (_, result) => {
      //res.set('etag', (new Date()).getTime() + '');  //assuming the file will be writen in same second
      if (req.get('accept-encoding')?.indexOf('gzip') !== -1) {
        res.set('content-type', 'application/json');
        res.set('content-encoding', 'gzip');
        const ETag = await EntsoeCache.write(result, req.url, config);
        if (ETag) {
          res.set('ETag', ETag);  //aws ETag
        }
        res.send(result);
      } else {
        res.send(data);
      }
      EntsoeCache.write(result, req.url, config);
      /*
      const fileName = req.url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileDirName = path.join(cacheDir, fileName);
      writeFile(fileDirName, result, (e) => {
        if (e) {
          console.log(e);
        }
      })
      */
    });
  }


  private static errorHandler(res: express.Response, e: Error): express.Response {
    if (e instanceof InputError) {
      return res.status(e.status).send({
        title: 'Invalid input',
        detail: e.message,
        status: 400
      });
    }
    if (e instanceof UpstreamError) {
      return res.status(e.rfc7807.status).send(e.rfc7807)
    }
    console.trace(e.message);
    if (axios.isAxiosError(e)) {
      console.log(`ENTSOE ERROR ${e.response?.status} ${e.response?.statusText}`)
      return res.status(e.response?.status || 500).send(`ENTSOE ERROR ${e.response?.statusText}`);
    } else {
      return res.status(500).send('unexpected internal error');
    }
  }

  /*
  static async writeCachedFile(data: string, cacheDir: string, url: string): Promise<void>{
    const fileName = url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileDirName = path.join(cacheDir, fileName);
    writeFile(fileDirName, data, (e) => {
      if (e) {
        console.log(e);
      }
    })
  }

  static async getCachedFile(fileDirName: string, ETag?: string): Promise<ReadStream | undefined> {
    const stats = await promises.stat(fileDirName);
    const fileTime = (new Date(stats.mtime)).getTime() + '';

    if (fileTime === ETag) {
      return;
    } else {
      const stream = createReadStream(fileDirName).on('error', e => {
        throw e;
      });
      return stream;

    }
  }
  */
}

