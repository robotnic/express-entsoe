import * as express from 'express'
import { InputError } from './Errors';
import { Loader } from './Loader';
import { CreateSwagger } from './Swagger';
import { gzip } from 'zlib';
import { createReadStream, fstat, readFile, stat, writeFile } from 'fs';
import path from 'path';
import { Datevalidator } from './Datevalidator';


interface Config {
  securityToken: string
  basePath?: string
  cacheDir?: string
  entsoeDomain?: string
  maxAge?: number
}

export class Entsoe {
  static init(config: Config) {
    let entsoeDomain = 'https://transparency.entsoe.eu';
    let cacheDir = './cacheDir/';
    let basePath = '/entsoe';
    let maxAge = 3600;

    if (config.basePath) {
      basePath = config.basePath;
    }
    if (config.cacheDir) {
      cacheDir = config.cacheDir;
    }
    if (config.maxAge) {
      maxAge = config.maxAge;
    }
    if (config.entsoeDomain) {
      entsoeDomain = config.entsoeDomain;
    }


    const loader = new Loader(config.securityToken, entsoeDomain);
    const router = express.Router();

    router.use(async (req, res, next) => {
      const fileName = req.url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileDirName = path.join(cacheDir, fileName);
      stat(fileDirName, (err, stats) => {
        if (err || req.get('refresh') === 'true') {
          next();
        } else {
          const fileTime = (new Date(stats.mtime)).getTime() + '';
          if (fileTime === req.get('If-None-Match')) {
            res.sendStatus(304);
          } else {
            res.set('Cache-Control', `public, max-age=${maxAge}`);
            res.set('content-type', 'application/json');
            res.set('content-encoding', 'gzip');
            res.set('etag', fileTime);
            const stream = createReadStream(fileDirName).on('error', ee => {
              next()
            })
            stream.pipe(res);
          }
        }
      })
    });



    router.get(`${basePath}/:country/installed`, async (req, res, next) => {
      const country = req.params.country;
      try {
        const [periodStart, periodEnd] = Datevalidator.getYear(req.query);
        const data = await loader.getInstalled(country, periodStart, periodEnd);
        this.send(req, res, data, cacheDir);
      } catch (e: any) {
        this.errorHandler(res, e);
      }
    })

    router.get(`${basePath}/:country/generation`, async (req, res, next) => {
      const country = req.params.country;
      let psrType: string | undefined
      if (typeof (req.query.psrType) === 'string') {
        psrType = req.query.psrType;
      }
      try {
        const [periodStart, periodEnd] = Datevalidator.getStartEnd(req.query);
        const data = await loader.getEntsoeData(country, 'generation', periodStart, periodEnd, psrType);
        this.send(req, res, data, cacheDir);
      } catch (e: any) {
        this.errorHandler(res, e);
      }
    })

    router.get(`${basePath}/:country/generation_per_plant`, async (req, res, next) => {
      const country = req.params.country;
      let psrType: string | undefined
      if (typeof (req.query.psrType) === 'string') {
        psrType = req.query.psrType;
      }
      try {
        const [periodStart, periodEnd] = Datevalidator.getStartEnd(req.query);
        const data = await loader.getEntsoeData(country, 'generation_per_plant', periodStart, periodEnd, psrType);
        this.send(req, res, data, cacheDir);
      } catch (e: any) {
        this.errorHandler(res, e);
      }
    })


    router.get(`${basePath}/:country/prices`, async (req, res, next) => {
      const country = req.params.country;
      try {
        const [periodStart, periodEnd] = Datevalidator.getStartEnd(req.query);
        const data = await loader.getEntsoeData(country, 'prices', periodStart, periodEnd);
        this.send(req, res, data, cacheDir);
      } catch (e: any) {
        this.errorHandler(res, e);
      }
    })

    router.get(`${basePath}/:country/hydrofill`, async (req, res, next) => {
      const country = req.params.country;
      try {
        const [periodStart, periodEnd] = Datevalidator.getStartEnd(req.query);
        const data = await loader.getEntsoeData(country, 'hydrofill', periodStart, periodEnd);
        this.send(req, res, data, cacheDir);
      } catch (e: any) {
        this.errorHandler(res, e);
      }
    })

    router.get(`${basePath}/:country/load`, async (req, res, next) => {
      const country = req.params.country;
      try {
        const [periodStart, periodEnd] = Datevalidator.getStartEnd(req.query);
        const data = await loader.getEntsoeData(country, 'load', periodStart, periodEnd);
        this.send(req, res, data, cacheDir);
      } catch (e: any) {
        this.errorHandler(res, e);
      }
    })

    router.get(`${basePath}/datalists/countries`, async (req, res, next) => {
      try {
        const data = await loader.getCountries();
        res.set('Cache-Control', 'public, max-age=31536000');
        res.send(data);
      } catch (e: any) {
        this.errorHandler(res, e);
      }
    })

    router.get(`${basePath}/datalists/psrtypes`, async (req, res, next) => {
      try {
        const data = await loader.getPsrTypes();
        res.set('Cache-Control', 'public, max-age=31536000');
        res.send(data);
      } catch (e: any) {
        this.errorHandler(res, e);
      }
    })



    router.get(`${basePath}`, async (req, res, next) => {
      try {
        const data = await CreateSwagger.load(basePath);
        res.set('Cache-Control', 'public, max-age=31536000');
        res.send(data);
      } catch (e: any) {
        this.errorHandler(res, e);
      }
    })


    return router;
  }

  static send(req: express.Request, res: express.Response, data: any, cacheDir: string) {
    const buf = Buffer.from(JSON.stringify(data), 'utf-8');
    gzip(buf, (_, result) => {
      res.set('etag', (new Date()).getTime() + '');  //assuming the file will be writen in same second
      if (req.get('accept-encoding')?.indexOf('gzip') !== -1) {
        res.set('content-type', 'application/json');
        res.set('content-encoding', 'gzip');
        res.send(result);
      } else {
        res.send(data);
      }
      const fileName = req.url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileDirName = path.join(cacheDir, fileName);
      writeFile(fileDirName, result, (e) => {
        if (e) {
          console.log(e);
        }
      })
    });
  }


  static errorHandler(res: express.Response, e: Error) {
    if (e instanceof InputError) {
      res.status(e.status).send(e.message);
    } else {
      console.trace(e.message);
      res.status(500).send('unexpected internal error');
    }
  }
}