import { prismaClient } from "../database/prismaClient";
import { Request, Response } from 'express';
import Joi from "joi";

const schema = Joi.object({
    username: Joi.string().min(5),
});

export class ProfileController {
    static async createProfile(req: Request, res: Response) {
        const { username, email, password } = req.body;

        if(!username || !email || !password) {
            return res.status(400).send('ERRO 400. Certifique-se de você está enviando um username, um email e uma senha.');
        }

        const { error } = schema.validate({username});

        if(error) {
            return res.status(400).send('ERRO 400. Não foi possível validar os dados, certifique-se de que o username tem ao menos 5 letras.');
        };
        try {
            const requester = await prismaClient.user.findUnique({ where: {email} });

            if(requester) {
                if(requester.password === password) {
                    const existentProfile = await prismaClient.profile.findUnique({where: {userId: requester.id}})
                    if(!existentProfile){
                        const newProfile = await prismaClient.profile.create({
                            data: {
                                username,
                                userId: requester.id
                            }
                        });

                        return res.status(200).send('Perfil criado com sucesso!');
                    } else if(existentProfile) {
                        return res.status(400).send('ERRO 400. Esse usuário já possuí um perfil.')
                    }
                } else if(requester.password !== password) {
                    return res.status(401).send('ERRO 401. Senha incorreta, por favor, tente novamente.')
                }
            } else if(!requester) {
                return res.status(404).send('ERRO 404. UserId não encontrado.')
            };
        } catch(err) {
            return res.status(500).send(`ERRO 500. Erro de resposta do servidor: ${err}`);
        };
    }   

    static async findAll(req: Request, res: Response) {
        const { email, password } = req.body;

        if(!password || !email) {
            return res.status(400).send('ERRO 400. Certifique-se de que você está enviando um email e uma senha.');
        };

        try{
            const requester = await prismaClient.user.findFirst({ where: { email } });

            if(!requester) {
                return res.status(404).send('ERRO 404. Usuário não encontrado.');
            } else if(requester.password === password) {
                    const allData = await prismaClient.profile.findMany({ select: { userId: false, id: false, username: true, createdAt: true, user: false, post: false, postR: false, _count: false } });

                    return res.status(200).json(allData);
            } else if(requester.password !== password) {
                return res.status(401).send('ERRO 401. Senha incorreta, por favor, tente novamente.')
            };
        } catch(err) {
            res.status(500).send(`ERRO 500. Erro de resposta do servidor: ${err}`);
        };
    }

    static async findOne(req: Request, res: Response) {
        const { email, password, username } = req.body;        

        if(!email || !password || !username) {
            return res.status(400).send('ERRO 400. Certifique-se de que você está enviando um email, uma senha e o username que deseja verificar.');
        };

        try{
            const requester = await prismaClient.user.findFirst({ where: { email } });

            if(!requester) {
                return res.status(404).send('ERRO 404. Usuário não encontrado.');
            } else if(requester.password === password) {
                const profile = await prismaClient.profile.findUnique({ where: { username }, select: {id: true, user: false ,userId: true, username: true, createdAt: true, post: true, postR: false}});

                if(!profile) {
                    return res.status(404).send('ERRO 404. O perfil buscado não existe.');
                } else if(profile) {
                    if(requester.admin || requester.id === profile.userId) {
                        return res.status(200).json(profile);
                    } else if(!requester.admin || requester.id !== profile.userId) {
                        console.log(requester.id, profile.userId)

                        const profileView = await prismaClient.profile.findUnique({ where: { username }, select: { id: false, user: false, userId: false, username: true, createdAt: true,  post: true, postR: false } });

                        return res.status(200).json(profileView)
                    }
                };

            } else if(requester.password !== password) {
                return res.status(401).send('ERRO 401. Senha incorreta, por favor, tente novamente.');
            };

        } catch(err) {
            return res.status(500).send(`ERRO 500. Erro de resposta do servidor: ${err}`);
        };
    }

    static async updateOne(req: Request, res: Response) {
        const { email, password, username } = req.body;
        const { id } = req.params;

        if(!email || !password) {
            return res.status(400).send('ERRO 400. Certifique-se de que você está enviando um email e uma senha.');
        };

        if(!username) {
            return res.status(400).send('ERRO 400. Não foi encontrada nenhuma informação.')
        }

        const { error } = schema.validate({username});

        if(error) {
            return res.status(400).send('ERRO 400. Não foi possível validar os dados, certifique-se de que o username tem ao menos 5 letras.');
        };

        try{
            const requester = await prismaClient.user.findFirst({ where: { email } });
            if(!requester) {
                return res.status(404).send('ERRO 404. Usuário não encontrado.');
            } else if(requester.password === password) {
                const profile = await prismaClient.profile.findUnique({ where: { userId: requester.id } })
                if(profile){
                    if(requester.admin || profile.id === id){
                        const updatedInfo = await prismaClient.profile.update({
                            where: { id },
                            data: { username }
                        });

                    return res.status(200).send('Dados atualizados com sucesso!');
                    } else if(!requester.admin || profile.id !== id) {
                        return res.status(401).send('ERRO 401. Usuário não autorizado.');
                    };
                } else if(!profile) {
                    return res.status(404).send('ERRO 404. Este usuário não possuí perfil. ')
                }
            } else if(requester.password !== password) {
                return res.status(401).send('ERRO 401. Senha incorreta, por favor, tente novamente.');
            };
        } catch(err) {
            return res.status(500).send(`ERRO 500. Erro de resposta do servidor: ${err}`);
        };
    }


    static async deleteOne(req: Request, res: Response) {
        const { email, password } = req.body;
        const { id } = req.params;

        if(!email || !password) {
            return res.status(400).send('ERRO 400. Certifique-se de que você está enviando um email e uma senha.')
        }

        if(!id) {
            return res.status(400).send('ERRO 400. Não foi recebido nenhum token para remoção.');
        };

        try{
            const requester = await prismaClient.user.findUnique({ where: {email} });

            if(!requester) {
                return res.status(404).send('ERRO 404. Usuário não encontrado.'); 
            } else if(requester.password === password) {
                if(requester.admin || requester.id === id) {
                    const deletedData = await prismaClient.profile.delete({ where: {id} });

                    return res.status(200).send('Usuário deletado com sucesso!');
                } else if(!requester.admin) {
                    return res.status(401).send('ERRO 401. Usuário não autorizado.')
                };
            } else if(requester.password !== password) {
                console.log(requester.password, password)
                return res.status(401).send('ERRO 401. Senha incorreta, por favor, tente novamente.');
            }
        } catch(err) {
            return res.status(500).send(`ERRO 500. Erro de resposta do servidor: ${err}`)
        }
    }
} 