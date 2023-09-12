import { prismaClient } from "../database/prismaClient";
import { Request, Response } from "express"
import Joi from "joi";

const schema = Joi.object({
    profileId: Joi.string().required(),
    title: Joi.string().min(6).max(35).required(),
    description: Joi.string().min(12).max(120).required(),
    content: Joi.string().max(2000),
});

export class PostController {
    static async createPost(req: Request, res: Response) {
        const { profileId, title, content, description }  = req.body;

        const id = profileId;

        if(!title || !profileId || !description ) {
            return res.status(400).send('ERRO 400. Certifique-se de que você enviou todos os campos.');
        };


        const { error } = schema.validate({profileId, title, description, content});

        if(error) {
            return res.status(400).send('ERRO 400. Erro de validação, favor verifique se todos os campos estão cumrpindo a validação.');
        };
        try{
            const requester = await prismaClient.profile.findUnique({ where: {id} });

            if(requester) {
                const author = requester.username;

                const info = {
                    profileId,
                    title,
                    content,
                    description,
                    author
                };

                const newPost = await prismaClient.post.create({ data: info });

                return res.status(200).send('Post criado com sucesso!');
            } else if(!requester) {
                return res.status(404).send('ERRO 404. Usuário não encontrado.');
            };
        }  catch(err) {
            return res.status(500).send(`ERRO 500. Erro de resposta do servidor: ${err}`);
        };
    }

    static async readPosts(req: Request, res: Response) {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).send('ERRO 400. Certifique-se de que você enviou todos os campos. (Email, Password)');
        };

        try {
            const requester = await prismaClient.user.findFirst({ where: {email} });

            if(!requester) {
                return res.status(404).send('ERRO 404. Usuário não encontrado.');
            } else if(requester.password === password) {
                const posts = await prismaClient.post.findMany({ select: { profileId: false } })

                return res.status(200).json(posts);
            } else if(requester.password !== password) {
                return res.status(401).send('ERRO 401. Senha incorreta, por favor, tente novamente.');
            };
        } catch(err) {
            return res.status(500).send(`ERRO 500. Erro de resposta do servidor: ${err}`);
        };
    }

    static async readOnePost(req: Request, res: Response) {
        const { email, password } = req.body;
        const { id } = req.params;

        if(!email || !password) {
            return res.status(400).send('ERRO 400. Certifique-se de que você enviou todos os campos. (Email, Password)');
        };

        try {
            const requester = await prismaClient.user.findFirst({ where: {email} });

            if(!requester) {
                return res.status(404).send('ERRO 404. Usuário não encontrado.');
            } else if(requester.password === password) {
                const posts = await prismaClient.post.findUnique({where: {id}, select: { profileId: false }})

                return res.status(200).json(posts);
            } else if(requester.password !== password) {
                return res.status(401).send('ERRO 401. Senha incorreta, por favor, tente novamente.');
            };
        } catch(err) {
            return res.status(500).send(`ERRO 500. Erro de resposta do servidor: ${err}`);
        };
    }

    static async updatePost(req: Request, res: Response) {
        const { info, email, password } = req.body;
        const { id } = req.params;

        if(!email || !password) {
            return res.status(400).send('ERRO 400. Certifique-se de que você enviou todos os campos. (Email, Password)');
        };

        const validKeys = ['title', 'description', 'content']

        for(const key in info) {
            if(!validKeys.includes(key)) {
                return res.status(404).send(`ERRO 404. O campo "${key}" não existe ou não pode ser alterado.`);
            };
        };

        const { error } = schema.validate(info);

        if(error) {
            return res.status(400).send('ERRO 400. Erro de validação, favor verifique se todos os campos estão cumrpindo a validação.');
        };

        try {
            const requester = await prismaClient.user.findFirst({ where: {email} });

            if(!requester) {
                return res.status(404).send('ERRO 404. Usuário não encontrado.');
            } else if(requester.password === password) {
                if(requester.admin) {
                    const updatedInfo = await prismaClient.post.update({ where: {id}, data: info});

                    return res.status(200).send('Dados atualizados com sucesso!');
                } else{
                    return res.status(401).send('ERRO 401. Usuário não autorizado.');
                };
            } else if(requester.password !== password) {
                return res.status(401).send('ERRO 401. Senha incorreta, por favor, tente novamente.')
            }
        } catch(err) {
            return res.status(500).send(`ERRO 500. Erro de resposta do servidor: ${err}`);
        };
    }   

    static async deleteOne(req: Request, res: Response) {
        const { email, password } = req.body;
        const { id } = req.params;

        try {
            const requester = await prismaClient.user.findFirst({ where: {email} });

            if(!requester) {
                return res.status(404).send('ERRO 404. Usuário não encontrado.');
            } else if(requester.password === password) {
                if(requester.admin || requester.email === email ) {
                    const deletedPost = await prismaClient.post.delete({ where:{id} })

                    return res.status(200).send('Dados deletados com sucesso!');
                } else {    
                    return res.status(401).send('ERRO 401. Usuário não autorizado.')
                }

            } else if(requester.password !== password) {
                return res.status(401).send('ERRO 401. Senha incorreta, por favor tente novamente.')
            }
        } catch(err) {
            return res.status(500).send(`ERRO 500. Erro de resposta do servidor: ${err}`);
        };
    }
};