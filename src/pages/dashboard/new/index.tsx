import { ChangeEvent, useState, useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { Container } from "../../../components/container";
import { DashBoardHeader } from "../../../components/panelHeader";
import { FiTrash, FiUpload } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { Input } from "../../../components/inputs";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidV4 } from 'uuid'
import { storage, db } from '../../../services/firebaseConnection'
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage'
import { addDoc, collection } from 'firebase/firestore'

const schema = z.object({
    name: z.string().nonempty("O campo nome é obrigatório."),
    model: z.string().nonempty("O modelo do veículo é obrigatório."),
    year: z.string().nonempty("O Ano do carro é obrigatório."),
    km: z.string().nonempty("O KM do carro é obrigatório."),
    price: z.string().nonempty("O preco é obrigatório."),
    city: z.string().nonempty("O campo cidade é obrigatório."),
    whatsapp: z.string().min(1, "O Telefone é obrigatório").refine((value) => /^(\d{10,12})$/.test(value), {
        message: "Numero de telefone inválido"
    }),
    description: z.string().nonempty("A descrição é obrigatória.")
})

type FormData = z.infer<typeof schema>

interface ImageItemProps {
    uid: string,
    name: string,
    previewUrl: string,
    url: string
}

export function New() {
    const { user } = useContext(AuthContext)

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    })

    const [carImages, setCarImage] = useState<ImageItemProps[]>([])

    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            const image = e.target.files[0]
            if (image.type === 'image/jpeg' || image.type === 'image/png') {
                await handleUpload(image)
            } else {
                alert('Enviado uma imagem jpeg ou png')
                return
            }
        }
    }

    async function handleUpload(image: File) {
        if (!user?.uid) {
            return
        }

        if (carImages.length >= 2) {
            alert('Você atingiu o limite máximo de imagens.');
            return;
        }
        const currentUid = user?.uid;
        const uidImage = uuidV4();
        const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)
        uploadBytes(uploadRef, image)
            .then((snapshot) => {
                getDownloadURL(snapshot.ref).then((downloadUrl) => {
                    console.log(downloadUrl)
                    const imageItem = {
                        name: uidImage,
                        uid: currentUid,
                        previewUrl: URL.createObjectURL(image),
                        url: downloadUrl
                    }

                    setCarImage((images) => [...images, imageItem])
                })
            })
    }

    function onSubmit(data: FormData) {

        const carListImages = carImages.map( car => {
            return {
                uid: car.uid,
                name: car.name,
                url: car.url
            }
        })

        addDoc(collection(db, 'cars'), {
            name: data.name,
            model: data.model,
            whatsapp: data.whatsapp,
            city: data.city,
            year: data.year,
            km: data.km,
            price: data.price,
            description: data.description,
            created: new Date(),
            owner: user?.name,
            user: user?.uid,
            images: carListImages
        }).then(() => {
            console.log('Cadastrado com sucesso!!')
            reset();
            setCarImage([])
        }).catch((error) => {
            console.log(error, 'Erro ao cadastrar')
        })
    }

    async function handleDeleteImage(item: ImageItemProps) {
        const imagePath = `images/${item.uid}/${item.name}`
        const imageRef = ref(storage, imagePath)
        try {
            await deleteObject(imageRef)
            setCarImage(carImages.filter(car => car.url !== item.url))
        } catch (err) {
            console.log(err, 'Erro ao deletar imagem')
        }
    }

    return (
        <Container>
            <DashBoardHeader />

            <div className="w-full bg-white p-3 rounded-lg flex flex-colsm:flex-row items-center gap-2">
                <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
                    <div className="absolute cursor-pointer">
                        <FiUpload size="23" color="#000" />
                    </div>

                    <div className="cursor-pointer">
                        <input type="file" accept="image/*" className="opacity-0 cursor-pointer" onChange={handleFile} />
                    </div>
                </button>

                {carImages.map(item => (
                    <div key={item.name} className="w-full h-32 flex items-center justify-center relative">
                        <button className="absolute" onClick={() => handleDeleteImage(item)}>
                            <FiTrash size={28} color="#fff" />
                        </button>
                        <img src={item.previewUrl} className="rounded-lg w-full h-32 object-cover" alt="Car image" />
                    </div>
                ))}
            </div>

            <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
                <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <p className="mb-2 font-medium">Nome do carro</p>
                        <Input
                            type="text"
                            register={register}
                            name="name"
                            error={errors.name?.message}
                            placeholder="Digite nome do veículo"
                        />
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Modelo do carro</p>
                        <Input
                            type="text"
                            register={register}
                            name="model"
                            error={errors.model?.message}
                            placeholder="Digite nome do veículo"
                        />
                    </div>

                    <div className="flex w-full mb-3 flex-row items-center gap-4">
                        <div className="w-full">
                            <p className="mb-2 font-medium">Ano</p>
                            <Input
                                type="text"
                                register={register}
                                name="year"
                                error={errors.year?.message}
                                placeholder="Digite o ano do veículo"
                            />
                        </div>

                        <div className="w-full">
                            <p className="mb-2 font-medium">Km Rodados</p>
                            <Input
                                type="text"
                                register={register}
                                name="km"
                                error={errors.km?.message}
                                placeholder="Digite a km do veículo"
                            />
                        </div>
                    </div>

                    <div className="flex w-full mb-3 flex-row items-center gap-4">
                        <div className="w-full">
                            <p className="mb-2 font-medium">Telefone/WhatsApp</p>
                            <Input
                                type="text"
                                register={register}
                                name="whatsapp"
                                error={errors.whatsapp?.message}
                                placeholder="Digite seu telefone/whatsapp"
                            />
                        </div>

                        <div className="w-full">
                            <p className="mb-2 font-medium">City</p>
                            <Input
                                type="text"
                                register={register}
                                name="city"
                                error={errors.city?.message}
                                placeholder="Digite sua cidade"
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Preço</p>
                        <Input
                            type="text"
                            register={register}
                            name="price"
                            error={errors.price?.message}
                            placeholder="R$ 0.000,00"
                        />
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Descrição</p>
                        <textarea
                            className="border-2 w-full rounded-md h-24 px-2"
                            {...register('description')}
                            name="description"
                            id="description"
                            placeholder="Digite a descrição do veículo."
                        />
                        {errors.description && <p className="mb-1 text-red-500">{errors.description.message}</p>}
                    </div>

                    <button type="submit" className="w-full rounded-md bg-zinc-900 text-white font-medium h-10">
                        Cadastrar
                    </button>
                </form>
            </div>
        </Container>
    )
}