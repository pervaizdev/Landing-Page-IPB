"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";


export default function CallBackSection() {
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.1,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const fadeUpSoft = {
    hidden: { opacity: 0, y: 35 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.0,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const [formData, setFormData] = useState({

    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!formData.email.endsWith("@gmail.com")) {
      toast.error("Please use a @gmail.com address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://islamabad-prime-builder-backend-production-05e2.up.railway.app/api/add-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        toast.error(data.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Server connection error. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className="bg-white py-16 text-black md:py-24">
      <div className="mx-auto max-w-7xl px-2">
        {/* Background Container (NO ANIMATION) */}
        <div
          className="rounded-[25px] bg-cover bg-center px-2 py-20 md:rounded-[36px] md:px-16 sm:px-10"
          style={{
            backgroundImage: "url('/images/1 ba night.jpg')",
          }}
        >
          {/* White Card (Animation starts here) */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="mx-auto max-w-4xl rounded-3xl bg-white px-4 py-12 shadow-xl sm:px-12"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="flex justify-center">
              <motion.span
                variants={fadeUpSoft}
                className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] shadow-sm"
                style={{
                  borderColor: "#d1b38c",
                  color: "#8B5E3C",
                  background: "rgba(209,179,140,0.1)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "#d1b38c" }}
                />
                QUICK IN TOUCH
              </motion.span>
            </motion.div>

            {/* Title */}
            <motion.h2
              variants={fadeUp}
              className="mt-6 text-center text-xl parisienne-font sm:text-2xl md:text-3xl"
            >
              Get specialist advice for residential,
              <br className="hidden sm:block" />
              commercial or property
            </motion.h2>

            {/* Form */}
            <Toaster position="top-right" />
            <motion.form
              variants={container}
              className="mt-10"
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <motion.div variants={fadeUp}>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name*"
                  />
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email*"
                  />
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number*"
                  />
                </motion.div>

                <motion.div variants={fadeUp} className="md:col-span-3">
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your Message..."
                  />
                </motion.div>
              </div>


              <motion.div
                variants={fadeUp}
                className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-xs text-gray-500">
                  We're excited to connect with you!
                  <br />
                  Required fields are marked *
                </p>

                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`mt-5 mx-auto flex items-center gap-3 rounded-full text-black bg-[#e2ceab] px-6 py-3 text-xs font-bold transition md:mx-0 md:mt-1 ${loading ? "opacity-50 cursor-not-allowed" : "hover:brightness-95 active:scale-95"}`}
                >
                  {loading ? "Sending..." : "Get A Call Back"}
                  {!loading && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-black">
                      →
                    </span>
                  )}
                </motion.button>

              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* Inputs */

function Input({ placeholder, name, value, onChange, type = "text" }) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-12 w-full rounded-full bg-gray-100 px-5 text-sm outline-none focus:ring-2 focus:ring-[#FACC15]"
    />
  );
}


function Textarea({ placeholder, name, value, onChange }) {
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      className="w-full resize-none rounded-2xl bg-gray-100 px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FACC15]"
    />
  );
}

