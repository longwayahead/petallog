import { motion, AnimatePresence } from "framer-motion";
import type {Transition} from "framer-motion";

export default function ConfirmDeleteModal({
  open,
    onCancel,
    onConfirm,
  }: {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
  }) {
    // shared transition timing, background and animate slide
  const spring: Transition = {
    type: "spring",
    damping: 25,
    stiffness: 300,
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={onCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={spring}
          />

          {/* Animated sheet */}
          <motion.div
            className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl p-4 pb-6"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={spring}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onCancel();
              }
            }}
          >
            {/* 👇 Add a tiny bottom extension to prevent black showing */}
            
              <div className="absolute bottom-[-16px] left-0 right-0 h-16 bg-white z-0" />

              {/* Handle bar */}
              <div className="relative z-100">
                <div className="mx-auto mt-2 w-12 h-1.5 bg-gray-200 rounded-full" />

                <div className="mt-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <i className="fa-solid fa-trash" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Delete this card?</h3>
                    <p className="text-sm text-gray-600">
                      This action can't be undone.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={onCancel}
                    className="px-3 py-2 rounded bg-gray-100"
                  >
                    Keep
                  </button>
                  <button
                    onClick={onConfirm}
                    className="px-3 py-2 rounded bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
