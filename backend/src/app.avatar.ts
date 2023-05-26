import { Controller, Req, Post, Body, Res, Get, Param } from '@nestjs/common';
import { FormDataRequest, IsFile, MaxFileSize, HasMimeType, MemoryStoredFile } from "nestjs-form-data";
import { User } from './user/app.user.manager';

const path = require('path')
const fs = require('fs')

class FormAvatarData {
	@IsFile()
	@MaxFileSize(1e6)
	@HasMimeType(['image/jpeg', 'image/png'])
	avatar: MemoryStoredFile;
}

@Controller("avatar")
export class AvatarController {
    constructor() {}

    @Post("upload")
    @FormDataRequest()
    async uploadAvatar(@Body() avatar: FormAvatarData, @Req() req: {MUser: User}, @Res() response) {
        if (!req.MUser.CanAction()) {
            response.status(403).send({statusCode: 403, message: "Forbidden"});
            return
        }
        const avatarPath = `./assets/avatars/${req.MUser.GetID()}.png`;
        let writer = fs.createWriteStream(avatarPath);
        writer.write(avatar["image"]["buffer"]);
        const oldNick = req.MUser.GetNick();
        await req.MUser.UpdateNick(req.MUser.GetNick());
        response.status(200).send({statusCode: 200, message: "OK"});
        return
    }

    readFile(path: string, response: any): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    return reject(err);
                }
            
                response.writeHead(200, {
                    'Content-Type': "image/png",
                    'Content-Length': data.length,
                });
            
                return resolve(data);
            });
        })
    }

    
    async SendDefaultAvatar(res: any) {
        const avatarPath = `assets/avatars/default.png`;
        const absolutePath = path.join(__dirname, "..", avatarPath);
        if (!fs.existsSync(absolutePath)) {
            res.status(404).send('Avatar not found')
            return
        }
        
        const fileData = await this.readFile(absolutePath, res);
        
        res.write(fileData);
        res.end();
    }

    
	@Get(":id.png")
    async getAvatar(@Req() req, @Res() res, @Param() params) {
        const id = params.id;
        if (!id || id === "") {
            await this.SendDefaultAvatar(res);
            return
        }

        const avatarPath = `assets/avatars/${id}.png`;
        const absolutePath = path.join(__dirname, "..", avatarPath);
        if (!fs.existsSync(absolutePath)) {
            await this.SendDefaultAvatar(res);
            return
        }
        
        const fileData = await this.readFile(absolutePath, res);
        
        res.write(fileData);
        res.end();
	}
}