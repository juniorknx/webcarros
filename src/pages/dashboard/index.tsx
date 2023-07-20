import { useEffect, useState, useContext } from "react";
import { Container } from "../../components/container";
import { DashBoardHeader } from "../../components/panelHeader";
import { FiTrash2 } from 'react-icons/fi'
import { collection, getDocs, where, query, doc, deleteDoc } from 'firebase/firestore'
import { db } from "../../services/firebaseConnection";
import { AuthContext } from "../../contexts/AuthContext";
interface CarProps {
    id: string,
    name: string,
    year: string,
    price: string | number,
    city: string,
    km: string,
    images: ImageCarProps[],
    uid: string
}

interface ImageCarProps {
    name: string,
    url: string,
    uid: string
}

export function Dashboard() {
    const [cars, setCars] = useState<CarProps[]>([])
    const { user } = useContext(AuthContext)

    useEffect(() => {
        async function loadCars() {
            if (!user?.uid) {
                return
            }

            const carRef = collection(db, "cars")
            const queryRef = query(carRef, where("uid", "==", user.uid))

            getDocs(queryRef)
                .then((snapshot) => {
                    let listCars = [] as CarProps[];
                    snapshot.forEach(doc => {
                        listCars.push({
                            id: doc.id,
                            name: doc.data().name,
                            year: doc.data().year,
                            km: doc.data().km,
                            city: doc.data().city,
                            price: doc.data().price,
                            images: doc.data().images,
                            uid: doc.data().uid
                        })
                    })
                    setCars(listCars)
                    console.log('user cars announced ==>', listCars)
                })
        }

        loadCars()
    }, [user])

    async function handleDeleteCars(id: string) {
        const docRef = doc(db, "cars", id)
        await deleteDoc(docRef);
        setCars(cars.filter(car => car.id !== id))
    }

    return (
        <Container>
            <DashBoardHeader />

            <main className="grid grid-cols-1 gap-6 md:gtid-cols-2 lg:grid-cols-3">
                {cars.map(cars => {
                    return (
                        <section key={cars.id} className="w-full bg-white rounded-lg relative">
                            <button className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow" onClick={() => handleDeleteCars(cars.id)}>
                                <FiTrash2 size={26} color="#000" />
                            </button>
                            <img className="w-full rounded-lg mb-2 max-h-70" src={cars.images[0].url} />
                            <p className="font-bold mt-1 px-2 mb-2">{cars.name}</p>
                            <div className="flex flex-col px-2">
                                <span className="text-zinc-700">
                                    Ano {cars.year} | {cars.km} km
                                </span>
                                <strong className="text-black font-bold mt-4">
                                    R$ {cars.price}
                                </strong>
                            </div>

                            <div className="w-full h-px bg-slate-200 my-2"></div>
                            <div className="px-2 pb-2">
                                <span className="text-black">{cars.city}</span>
                            </div>
                        </section>
                    )
                })}
            </main>
        </Container>
    )
}