"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkScheduledTasks = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const nodemailer = __importStar(require("nodemailer"));
admin.initializeApp();
const db = admin.firestore();
// Configure Nodemailer transporter
// Ensure you have set these config values:
// firebase functions:config:set gmail.email="ammar.shtayeh@gmail.com" gmail.password="YOUR_APP_PASSWORD"
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});
exports.checkScheduledTasks = functions.pubsub.schedule("every 5 minutes").onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    try {
        const tasksSnapshot = await db.collectionGroup("tasks")
            .where("scheduledAt", "<=", now)
            .where("reminderSent", "==", false)
            .where("completed", "==", false)
            .get();
        if (tasksSnapshot.empty) {
            console.log("No scheduled tasks found.");
            return null;
        }
        const updates = [];
        for (const doc of tasksSnapshot.docs) {
            const task = doc.data();
            if (!task.email) {
                console.log(`Skipping task ${doc.id} (no email)`);
                continue;
            }
            // Email content
            const mailOptions = {
                from: `Mindar App <${gmailEmail}>`,
                to: task.email,
                subject: `تذكير بمهمة: ${task.title}`,
                html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="background-color: #3b82f6; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">تذكير بمهمة ⏰</h1>
              </div>
              <div style="padding: 30px;">
                <h2 style="color: #1f2937; margin-top: 0;">مرحباً!</h2>
                <p style="color: #4b5563; font-size: 16px;">هذا تذكير بموعد مهمتك المجدولة:</p>
                
                <div style="background-color: #eff6ff; border-right: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                  <h3 style="margin: 0; color: #1e40af;">${task.title}</h3>
                  ${task.description ? `<p style="margin: 10px 0 0; color: #4b5563;">${task.description}</p>` : ''}
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://quizzapps.web.app/todo" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">إذهب للمهام</a>
                </div>
              </div>
              <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
                تم إرسال هذا التذكير تلقائياً من تطبيق Mindar
              </div>
            </div>
          </div>
        `
            };
            // Send email and verify success before updating DB
            const promise = transporter.sendMail(mailOptions)
                .then(() => {
                console.log(`Email sent to ${task.email} for task ${doc.id}`);
                return doc.ref.update({ reminderSent: true });
            })
                .catch((emailError) => {
                console.error(`Failed to send email for task ${doc.id}:`, emailError);
                return null;
            });
            updates.push(promise);
        }
        await Promise.all(updates);
        console.log(`Processed ${updates.length} tasks.`);
        return null;
    }
    catch (error) {
        console.error("Error checking scheduled tasks:", error);
        return null;
    }
});
//# sourceMappingURL=index.js.map