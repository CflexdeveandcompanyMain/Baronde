import "dotenv/config";
import express, { Request, Response } from "express";
import { usermodel } from "../model/user";
import { sign } from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendmail from "../utils/mailer";
import { SendMailOptions } from "nodemailer";
import crypto from "crypto"


const generateToken = (userId: string) => {
  const secretKey = process.env.SECRET_KEY as string;
  return sign({ id: userId }, secretKey, { expiresIn: "1d" });
};

function generate5DigitOTP(): string {
  const buffer = crypto.randomBytes(3); 
  const otp = Math.floor(parseInt(buffer.toString('hex'), 16) / 1677.7216) 
    .toString()
    .padStart(5, '0');
  return otp;
}



export const requestAdminOtp = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      res.status(400).json({ message: "Name and email are required" });
      return
    }

    const otp = generate5DigitOTP();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);
    
    
    const tempOtpHolder = new usermodel({
      name: `Temp-${name}`,
      email: `temp-${Date.now()}-${email}`,
      password: "temporaryPassword" + Math.random(),
      role: "user",
      otp: {
        code: otp,
        expiresAt: expiresAt
      }
    });
    
    await tempOtpHolder.save();

   
    
    const mailOptions = {
      from: `"BarondeMusical" <${process.env.EMAIL_USER_NAME}>`,
      to: email,
      subject: "User Account Creation",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #222;">Ghost Market Admin Verification</h2>
          <p>Hello ${name},</p>
          <p><strong>Name:</strong>your one time password is:</p>
          <h3 style="background-color: #f0f0f0; padding: 10px; text-align: center;">${otp}</h3>
          <p>This OTP will expire in 2 hours.</p>
          <p>If you did not authorize this request, please ignore this email.</p>
        </div>
      `
    };
    
    await sendmail(mailOptions);

    res.status(200).json({ 
      message: "Admin OTP sent to administrator",
      otpId: tempOtpHolder._id
    });
  } catch (error) {
    console.error("Admin OTP request error:", error);
    res.status(500).json({ message: "Failed to request admin OTP" });
  }
};   


export const SignUp = async (req: Request, res: Response) => {
  const { name, email, password, role, adminOtp, otpId } = req.body;

  try {
    if (!name || !email || !password) {
     res.status(400).json({ message: "Name, email and password are required" });
     return 
    }

    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
     res.status(400).json({ message: "Email already in use" });
     return 
    }

    
    if (role === "user") {
      if (!adminOtp || !otpId) {
       res.status(400).json({ message: "OTP and OTP ID are required for admin registration" });
       return 
      }

     
      const otpRecord = await usermodel.findOne({
        _id: otpId,
        "otp.code": adminOtp,
        "otp.expiresAt": { $gt: new Date() }
      });

      if (!otpRecord) {
        res.status(400).json({ message: "Invalid or expired OTP" });
        return 
      }

      
      await usermodel.findByIdAndDelete(otpId);
    }

    
    const user = new usermodel({ name, email, password, role });
    await user.save();

    const token = generateToken(user.id);
    res.setHeader("Authorization", `Bearer ${token}`);

    
    const welcomeMailOptions = {
      from: `"BarondeMusical" <${process.env.EMAIL_USER_NAME}>`,
      to: user.email,
      subject: "Welcome to BarondeMusical",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #222;">Welcome to BarondeMusical</h2>
        <p>Hi ${user.name},</p>
          <p>Thank you for signing up to <strong>BarondeMusical</strong> — your new go-to destination for exclusive Musical assets, collectibles, and unique market experiences.</p>
          <p>We're thrilled to have you join our growing community. Here's what you can do next:</p>
          <ul>
            <li>Explore unique listings and rare finds</li>
            <li>Manage your collection and profile</li>
            <li>Stay tuned for upcoming auctions and marketplace updates</li>
          </ul>
          <p>If you ever need help, questions, or suggestions — we're just a message away.</p>
          <p style="margin-top: 30px;">Welcome aboard!</p>
          <p>The <strong>BarondeMusical</strong> Team</p>
          <hr style="margin: 40px 0;" />
          <small style="color: #888;">You received this email because you signed up for an account at BarondeMusical.</small>
        </div>
      `
    };

    await sendmail(welcomeMailOptions);

     res.status(201).json({
      message: "Account created successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to create account" });
    return
  }
};

//irahmancerts@gmail.com
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return
    }

    const user = await usermodel.findOne({ email }).select("+password");
    if (!user) {
       res.status(400).json({ message: "Invalid email or password" });
       return
    }

    
    if (user.lockUntil && user.lockUntil > new Date()) {
      const secs = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000);
      const mins = Math.floor(secs / 60);
      const secRem = secs % 60;
       res.status(423).json({ message: `Too many attempts. Try again in ${mins}m ${secRem}s.` });
       return
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      user.loginAttempts++;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      res.status(400).json({
        message: "Invalid email or password",
        attemptsRemaining: Math.max(0, 5 - user.loginAttempts)
      });
      return 
    }

   
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const token = generateToken(user.id);
    res.setHeader("Authorization", `Bearer ${token}`);

    res.status(200).json({
      status: "success",
      message: "Login successful",
      user: { id: user.id, email: user.email, role: user.role }
    });
    return
  } catch (error) {
    console.error("Login error:", error);
     res.status(500).json({ message: "Failed to login" });
     return
  }
};


export const getUser = async (req: Request, res: Response) => {
    try {
        
        const { id } = req.params;

        
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({ message: "Invalid user ID format" });
            return;
        }

        
        const user = await usermodel.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        
        res.status(200).json({
            status: "success",
            message: "User retrieved successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
               
            },
        });
    } catch (error) {
        console.error("Error retrieving user:", error);


        res.status(500).json({
            message: "An error occurred while retrieving the user",
        });
    }
};

export const allUser = async (req: Request, res: Response) => {
    try {
        
        const users = await usermodel.find();
        if (!users) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        
        res.status(200).json({
            status: "success",
            message: "all Users retrieved successfully",
           users,
        });
    } catch (error) {
        console.error("Error retrieving user:", error);


        res.status(500).json({
            message: "An error occurred while retrieving the user",
        });
    }
};




  