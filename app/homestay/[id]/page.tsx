"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Home, User, Bath, BedDouble, CheckCircle, ChefHat, Wifi, MonitorPlay, Car } from "lucide-react";
import { use } from "react";
import BookingModal from "@/components/BookingModal";

export default function HomestayDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [room, setRoom] = useState<any>(null);
    const [photos, setPhotos] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function fetchRoom() {
            setLoading(true);
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                setLoading(false);
                return;
            }

            setRoom(data);

            const { data: photosData } = await supabase
                .from('room_photos')
                .select('url')
                .eq('room_id', id)
                .order('created_at', { ascending: false });

            if (photosData) {
                setPhotos(photosData.map(p => p.url));
            }
            setLoading(false);
        }

        fetchRoom();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#111216] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-[#111216] text-white flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-4">Room Not Found</h1>
                <Link href="/" className="px-6 py-3 bg-[var(--accent)] rounded-lg font-bold">Return Home</Link>
            </div>
        );
    }

    const mainImage = room.image || (photos.length > 0 ? photos[0] : '/placeholder.jpg');
    const amenitiesList = room.amenities ? room.amenities.split(',').map((a: string) => a.trim()) : [];

    // Group amenities into categories visually
    const features = [
        { title: "Intelligent Interiors", desc: "Creating beautiful, functional spaces that elevate your lifestyle.", img: photos[1] || mainImage },
        { title: "Smart Space Planning", desc: "Optimizing layouts for the perfect flow, effective utility and comfort.", img: photos[2] || mainImage },
        { title: "Exceptional Residences", desc: "Breathtaking homes crafted with modern elegance.", img: photos[3] || mainImage },
    ];

    return (
        <div className="min-h-screen bg-[#111216] text-white selection:bg-[var(--accent)] selection:text-white pb-20 overflow-x-hidden">
            {/* Hero Section */}
            <header className="relative w-full min-h-[85vh] flex items-center pt-20 pb-16 px-6 lg:px-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={mainImage} className="w-full h-full object-cover opacity-20" alt="Background" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#111216] via-[#111216]/90 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111216] via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 pt-10">
                    <div className="w-full lg:w-1/2 flex flex-col items-start animate-slide-right">
                        <Link href="/" className="inline-flex items-center gap-2 text-[var(--accent-light)] hover:text-white transition-colors mb-10 group">
                            <span className="w-8 h-8 rounded-full border border-[var(--accent-light)] group-hover:border-white flex items-center justify-center transition-all bg-[var(--accent)]/10">
                                <ArrowLeft size={16} />
                            </span>
                            <span className="text-sm font-semibold tracking-wider uppercase">Back to Main Page</span>
                        </Link>

                        <div className="flex items-center gap-3 mb-6">
                            <User size={20} className="text-[var(--accent)]" />
                            <span className="text-[var(--accent)] tracking-[0.2em] uppercase text-xs font-bold font-mono">
                                {room.type || "Exclusive Homestay"}
                            </span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-white mb-6">
                            <span className="block opacity-90 font-light">Experience</span>
                            <span className="text-[var(--accent)] block mt-2">{room.title}</span>
                        </h1>

                        <p className="text-lg text-gray-300 leading-relaxed mb-10 max-w-xl font-light" style={{ whiteSpace: 'pre-wrap' }}>
                            {room.description || "Architectural & interior solutions tailored to your home's needs."}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-[#111216] font-bold rounded shadow-lg transition-all hover:scale-105 cursor-pointer uppercase tracking-wider text-sm flex items-center gap-2"
                            >
                                <span className="font-extrabold text-lg">RM{room.price}</span> / Night
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-8 py-4 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[#111216] font-bold rounded shadow-lg transition-all uppercase tracking-wider text-sm flex items-center justify-center"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 relative animate-fade-in delay-200">
                        <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group">
                            <img src={mainImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={room.title} />
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded text-white text-xs font-bold uppercase tracking-widest border border-white/10">
                                Featured
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[var(--accent)]/20 rounded-full blur-3xl"></div>
                        <div className="absolute -top-6 -right-6 w-40 h-40 bg-[var(--accent)]/10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </header>

            {/* Grid Image Section - Replicating Image layout */}
            <section className="max-w-7xl mx-auto px-6 lg:px-20 py-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
                    {/* Large feature block */}
                    <div className="md:col-span-7 group bg-[#1a1b22] border border-white/5 overflow-hidden transition-all hover:border-[var(--accent)]/30 shadow-xl">
                        <div className="w-full h-[300px] lg:h-[400px] overflow-hidden">
                            <img src={features[0].img} alt="Interior" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                        </div>
                        <div className="p-8 lg:p-10 relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--accent)]/10 to-transparent"></div>
                            <h3 className="text-2xl font-bold mb-3 text-white">{features[0].title}</h3>
                            <p className="text-gray-400 font-light flex items-center justify-between">
                                <span>{features[0].desc}</span>
                                <ArrowUpRight className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                        </div>
                    </div>

                    {/* Right side stacked blocks */}
                    <div className="md:col-span-5 flex flex-col gap-6 lg:gap-8">
                        <div className="flex-1 group bg-[#1a1b22] border border-white/5 flex flex-col overflow-hidden transition-all hover:border-[var(--accent)]/30 shadow-xl">
                            <div className="p-6 lg:p-8 flex-1 flex flex-col justify-center bg-gradient-to-br from-[#1a1b22] to-[#22242c]">
                                <h3 className="text-xl font-bold mb-2 text-white">{features[1].title}</h3>
                                <p className="text-sm text-gray-400 font-light pr-12">{features[1].desc}</p>
                            </div>
                            <div className="h-48 overflow-hidden">
                                <img src={features[1].img} alt="Plan" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100 grayscale hover:grayscale-0" />
                            </div>
                        </div>

                        <div className="flex-1 group bg-[#1a1b22] border border-white/5 relative overflow-hidden transition-all hover:border-[var(--accent)]/30 shadow-xl">
                            <img src={features[2].img} alt="Residences" className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-1000 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                            <div className="relative h-full min-h-[220px] p-6 lg:p-8 flex flex-col justify-end">
                                <h3 className="text-xl font-bold mb-2 text-white">{features[2].title}</h3>
                                <p className="text-sm text-gray-300 font-light flex items-center justify-between">
                                    <span>{features[2].desc}</span>
                                    <ArrowUpRight className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Stats & Features Row */}
            <section className="bg-[#16171d] py-16 border-y border-white/5 mt-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-20 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { icon: <Home size={28} />, title: "Modern Setup", desc: "Contemporary aesthetic." },
                        { icon: <BedDouble size={28} />, title: `${room.beds || 3} Bedrooms`, desc: "Comfortable layout." },
                        { icon: <User size={28} />, title: `Up to ${room.guests || 8} Guests`, desc: "Spacious enough." },
                        { icon: <CheckCircle size={28} />, title: "Build Success", desc: "Smart solutions." }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded border border-white/10 bg-[#1a1b22] flex items-center justify-center text-[var(--accent)] mb-4 transition-all group-hover:bg-[var(--accent)] group-hover:text-black">
                                {item.icon}
                            </div>
                            <h4 className="font-bold text-white mb-1 tracking-wide">{item.title}</h4>
                            <p className="text-xs text-gray-500 font-light">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* All Photos Gallery */}
            {photos.length > 0 && (
                <section className="py-24 max-w-7xl mx-auto px-6 lg:px-20">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-bold"><span className="text-[var(--accent)]">Project</span> Gallery</h2>
                        <div className="h-[1px] flex-1 bg-white/10 ml-8"></div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {photos.map((p, i) => (
                            <div key={i} className={`group overflow-hidden rounded-sm bg-[#1a1b22] aspect-w-4 aspect-h-3 border border-white/5 ${i === 0 || i === 3 ? 'lg:col-span-2' : ''}`}>
                                <img src={p} className="w-full h-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100" alt={`Room view ${i + 1}`} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Value Provided Section */}
            <section className="py-20 bg-[#16171d] relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[var(--accent)]/5 blur-3xl rounded-full"></div>
                <div className="max-w-7xl mx-auto px-6 lg:px-20 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-[var(--accent)] uppercase tracking-[0.2em] font-bold text-xs">Included Value</span>
                        <h2 className="text-4xl font-bold mt-2 text-white">What You Get</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {amenitiesList.map((amenity: string, i: number) => {
                            let icon = <CheckCircle size={24} />;
                            const aLow = amenity.toLowerCase();
                            if (aLow.includes('kitchen')) icon = <ChefHat size={24} />;
                            if (aLow.includes('wifi')) icon = <Wifi size={24} />;
                            if (aLow.includes('tv')) icon = <MonitorPlay size={24} />;
                            if (aLow.includes('parking')) icon = <Car size={24} />;
                            if (aLow.includes('pool') || aLow.includes('bath')) icon = <Bath size={24} />;

                            return (
                                <div key={i} className="flex flex-col p-6 bg-[#1a1b22] border border-white/5 rounded-sm hover:-translate-y-2 hover:border-[var(--accent)]/40 transition-all shadow-lg group">
                                    <div className="w-12 h-12 rounded bg-black/50 text-[var(--accent)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/5">
                                        {icon}
                                    </div>
                                    <h4 className="font-bold text-white text-lg tracking-wide">{amenity}</h4>
                                    <p className="text-sm text-gray-500 mt-2 font-light">Available for your comfort & use throughout the stay.</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                room={room}
            />
        </div>
    );
}
