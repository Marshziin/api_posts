import { prismaClient } from "../database/prismaClient";
import { Request, Response } from "express";
import Joi from 'joi'


export class UserController {
    static async createUser(req: Request, res: Response) {
        const { name, email, password } = req.body;

        if(!name || !password || !email) {
            return res.status(400).send('ERRO 400. Certifique-se de que você está enviando um nome um email e uma senha.');
        };

        const schema = Joi.object({
            name: Joi.string().required().min(3).max(20),
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(15)
        });
        
        const { error } = schema.validate(req.body);

        if(error) {
            return res.status(400).send('ERRO 400. Não foi possível válidar os dados enviados, certifique-se de que o nome tem ao menos 3 letras, o email seja válido e a senha ao menos 8 caracteres.'+error);
        }

        try {
            const exist = await prismaClient.user.findUnique({ where: {email} });

            if(exist) {
                return res.status(400).send(`ERRO 400. O email inserido ${email} já está cadastrado na plataforma.`);
            }

                const newUser = await prismaClient.user.create({
                    data: {
                        name,
                        email,
                        password,
                    }
                });
                return res.status(200).send('Usuário criado com sucesso!');

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
                if(requester.admin){
                    const allData = await prismaClient.user.findMany();

                    return res.status(200).json(allData);
                } else if(!requester.admin) {
                    return res.status(401).send('ERRO 401. Usuário não autorizado.')
                }
            } else if(requester.password !== password) {
                return res.status(401).send('ERRO 401. Senha incorreta, por favor, tente novamente.')
            };
        } catch(err) {
            res.status(500).send(`ERRO 500. Erro de resposta do servidor: ${err}`);
        };
    }

    static async findOne(req: Request, res: Response) {
        const { email, password } = req.body;
        const { id } = req.params;

        if(!email || !password) {
            return res.status(400).send('ERRO 400. Certifique-se de que você está enviando um email e uma senha.');
        };

        try{
            const requester = await prismaClient.user.findFirst({ where: { email } });

            if(!requester) {
                return res.status(404).send('ERRO 404. Usuário não encontrado.');
            } else if(requester.password === password) {
                if(id === 'myinfo'){
                    const user = await prismaClient.user.findUnique({where: {id: requester.id}});

                    res.status(200).json(user);
                } else if(requester.admin || requester.id === id) {
                    const user = await prismaClient.user.findUnique({ where: {id} });
                    if(!user) {
                        console.log(id)
                        return res.status(404).send('ERRO 404. O usuário que foi buscado não foi encontrado.');
                    } else if(user) {
                        return res.status(200).json(user);
                    };
                } else if(!requester.admin){
                    return res.status(401).send('ERRO 401. Usuário não autorizado.')
                };
            } else if(requester.password !== password) {
                return res.status(401).send('ERRO 401. Senha incorreta, por favor, tente novamente.')
            };
        } catch(err) {
            return res.status(500).send(`ERRO 500. Erro de resposta do servidor: ${err}`);
        };
    }

    static async updateOne(req: Request, res: Response) {
        const { email, password, info } = req.body;
        const { id } = req.params;

        if(!email || !password) {
            return res.status(400).send('ERRO 400. Certifique-se de que você está enviando um email e uma senha.');
        };

        if(!info || typeof info !== 'object') {
            return res.status(400).send('ERRO 400. Não foi encontrada nenhuma informação ou os campos que foram enviados não são do tipo objeto.')
        }

        const validKeys = ['email', 'passoword', 'name'];

        for(const key in info) {
            if(!validKeys.includes(key)) {
                return res.status(404).send(`ERRO 404. O campo "${key}" não existe ou não pode ser alterado.`);
            };
        };

        try{
            const requester = await prismaClient.user.findFirst({ where: { email } });

            if(!requester) {
                return res.status(404).send('ERRO 404. Usuário não encontrado.');
            } else if(requester.password === password) {
                if(requester.admin || requester.id === id){
                    const updatedInfo = await prismaClient.user.update({
                        where: { id },
                        data: info
                    });

                return res.status(200).send('Dados atualizados com sucesso!');
                } else if(!requester.admin) {
                    return res.status(401).send('ERRO 401. Usuário não autorizado.')
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
                if(requester.admin) {
                    const deletedData = await prismaClient.user.delete({ where: {id} });

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
        };
    }

};