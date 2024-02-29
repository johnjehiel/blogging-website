import { AnimatePresence, motion } from "framer-motion";

const AnimationWrapper = ( { children, keyValue, className, initial = { opacity: 0 }, animate = { opacity: 1}, transition = { duration : 1} }) => {
    return (
        <AnimatePresence> {/* AnimatePresence is used to keep track of the animations */}
            <motion.div
                key={keyValue} // to let motion.div differenciate between signin and signup to apply animation when switching b/w both
                initial={initial} // initial state
                animate={animate} // final state 
                transition={transition}
                className={className}
            >
                { children }
            </motion.div>
        </AnimatePresence>
    )
}

export default AnimationWrapper;