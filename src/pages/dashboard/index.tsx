import { useEffect, useState, useContext } from "react";
import { Container } from "../../components/container";
import { DashBoardHeader } from "../../components/panelHeader";
import { FiTrash2 } from 'react-icons/fi'
import { collection, getDocs, where, query } from 'firebase/firestore'
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
    return (
        <Container>
            <DashBoardHeader />

            <main className="grid grid-cols-1 gap-6 md:gtid-cols-2 lg:grid-cols-3">
                <section className="w-full bg-white rounded-lg relative">
                    <button className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow" onClick={() => { }}>
                        <FiTrash2 size={26} color="#000" />
                    </button>
                    <img className="w-full rounded-lg mb-2 max-h-70" src="https://firebasestorage.googleapis.com/v0/b/webcarros-8954a.appspot.com/o/images%2FFW5wYypFgdS5eZcvUag3EYsKi093%2F829b0c97-a0e3-4511-b0db-24049d2e8b7a?alt=media&token=7b0f9a74-cb45-4d52-99f1-7de1cd03ec16" />
                    <p className="font-bold mt-1 px-2 mb-2">Nissan Versa</p>
                    <div className="flex flex-col px-2">
                        <span className="text-zinc-700">
                            Ano 2016 | 230.000 km
                        </span>
                        <strong className="text-black font-bold mt-4">
                            R$ 34.000
                        </strong>
                    </div>

                    <div className="w-full h-px bg-slate-200 my-2"></div>
                    <div className="px-2 pb-2">
                        <span className="text-black"> Porto Alegre - RS</span>
                    </div>
                </section>
            </main>
        </Container>
    )
}