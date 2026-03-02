import { motion } from 'framer-motion';

export const FloatingElements = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-multiply opacity-70">
            {/* Floating Chat Bubble */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, -5, 0],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-1/4 left-[15%] w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12"
            >
                <span className="text-4xl">💬</span>
            </motion.div>

            {/* Floating YouTube Icon */}
            <motion.div
                animate={{
                    y: [0, 30, 0],
                    rotate: [0, -10, 10, 0],
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                }}
                className="absolute top-1/3 right-[20%] w-20 h-20 bg-red-100 rounded-full flex items-center justify-center shadow-lg"
            >
                <span className="text-4xl">▶️</span>
            </motion.div>

            {/* Floating Document/Transcript */}
            <motion.div
                animate={{
                    x: [0, 20, 0],
                    y: [0, -15, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
                className="absolute bottom-1/4 left-[25%] w-32 h-40 bg-white rounded-xl shadow-xl flex flex-col items-center justify-center gap-2 p-4 rotate-6 border border-gray-100"
            >
                <div className="w-full h-2 bg-gray-200 rounded-full"></div>
                <div className="w-5/6 h-2 bg-gray-200 rounded-full"></div>
                <div className="w-full h-2 bg-gray-200 rounded-full"></div>
                <div className="w-4/5 h-2 bg-gray-200 rounded-full"></div>
                <span className="text-2xl mt-2">📄</span>
            </motion.div>

            {/* Floating Question Mark */}
            <motion.div
                animate={{
                    y: [0, -25, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                }}
                className="absolute bottom-1/3 right-[15%] w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center shadow-md -rotate-12"
            >
                <span className="text-3xl">❓</span>
            </motion.div>

            {/* Abstract Shape 1 */}
            <motion.div
                animate={{
                    y: [0, 40, 0],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0,
                }}
                className="absolute top-10 left-[40%] w-6 h-6 rounded-full bg-blue-500 blur-sm opacity-50"
            ></motion.div>

            {/* Abstract Shape 2 */}
            <motion.div
                animate={{
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                }}
                className="absolute bottom-20 right-[40%] w-10 h-10 rounded-full bg-red-500 blur-md opacity-40"
            ></motion.div>
        </div>
    );
};
