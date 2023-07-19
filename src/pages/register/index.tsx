import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../../assets/logo.svg'
import { Container } from '../../components/container'
import { Input } from '../../components/inputs'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { auth } from '../../services/firebaseConnection'
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth'
import { AuthContext } from '../../contexts/AuthContext'
import { useContext } from 'react'

const schema = z.object({
    name: z.string().nonempty("O campo é obrigatório"),
    email: z.string().email("Insira um e-mail válido").nonempty("O Campo e-mail é obrigatorio"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").nonempty("O campo de senha é obrigatório")
})

type FormData = z.infer<typeof schema>

export function Register() {
    const { handleInfoUser } = useContext(AuthContext)

    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    })

    useEffect(() => {
        async function handleLogout() {
            await signOut(auth)
        }

        handleLogout
    }, [])

    async function onSubmit(data: FormData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            await updateProfile(userCredential.user, {
                displayName: data.name
            });
    
            handleInfoUser({
                name: data.name,
                email: data.email,
                uid: userCredential.user?.uid
            })

            console.log('Cadastrado com sucesso');
            navigate('/dashboard');
        } catch (error) {
            console.log('error', error);
        }
    }

    return (
        <Container>
            <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
                <Link to="/" className='mb-6 max-w-sm w-full'>
                    <img
                        src={logoImg}
                        alt='Logo'
                        className='w-full'
                    />
                </Link>

                <form onSubmit={handleSubmit(onSubmit)} className='bg-white max-w-xl w-full rounded-lg p-4'>
                    <div className='mb-3'>
                        <Input
                            type="text"
                            placeholder="Digite seu nome"
                            name="name"
                            error={errors.name?.message}
                            register={register}
                        />
                    </div>

                    <div className='mb-3'>
                        <Input
                            type="email"
                            placeholder="Digite seu e-mail"
                            name="email"
                            error={errors.email?.message}
                            register={register}
                        />
                    </div>

                    <div>
                        <Input
                            type="password"
                            placeholder="Digite sua senha"
                            name="password"
                            error={errors.password?.message}
                            register={register}
                        />
                    </div>
                    <button type='submit' className='bg-zinc-900 w-full rounded-md text-white h-10 font-medium mt-4'>
                        Cadastrar
                    </button>
                </form>

                <Link to={'/login'}>
                    Ja possui uma conta? Faça Login!
                </Link>
            </div>
        </Container>
    )
}