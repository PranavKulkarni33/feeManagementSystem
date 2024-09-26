const functions = require('firebase-functions')
const admin=require('firebase-admin');
const nodemailer =require('nodemailer');
const moment = require('moment');
admin.initializeApp()
require('dotenv').config()

const {SENDER_EMAIL,SENDER_PASSWORD}= process.env;

exports.sendEmailNotification=functions.firestore.document('StudentDatabase/{id}')
.onCreate((snap,ctx)=>{
    const data=snap.data();
    let authData=nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:465,
        secure:true,
        auth:{
            user:SENDER_EMAIL,
            pass:SENDER_PASSWORD
        }
    });
authData.sendMail({
from :'pranavkul33@gmail.com',
to:`${data.email}`,
subject:'Your submission Info',
text:`${data.email}`,
html:`${data.email}`,
}).then(res=>console.log('successfully sent that mail')).catch(err=>console.log(err));

});


const mailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD
    }
});

exports.sendDueDateEmailReminder = functions.pubsub.schedule('every 1 minutes')  // 10:00 PM every day
    .timeZone('America/Los_Angeles')  // Set your preferred time zone
    .onRun(async (context) => {
        const threeDaysLater = moment().add(3, 'days').format('YYYY-MM-DD'); // Get the date 3 days from now

        try {
            // Query Firestore for all students
            const snapshot = await admin.firestore().collection('StudentDatabase').get();

            if (snapshot.empty) {
                console.log('No students found.');
                return null;
            }

            // Send an email to each student whose installment is due in 3 days
            const emailPromises = [];
            snapshot.forEach(doc => {
                const student = doc.data();
                
                // Check each date in datesOfFeesToBePaid
                const installmentDates = Object.keys(student.datesOfFeesToBePaid);
                installmentDates.forEach(date => {
                    if (date === threeDaysLater) {
                        const dueAmount = student.datesOfFeesToBePaid[date];
                        
                        const emailPromise = mailTransporter.sendMail({
                            from: SENDER_EMAIL,
                            to: student.email,
                            subject: 'Upcoming Payment Due Reminder',
                            text: `Dear ${student.name}, you have a payment of ${dueAmount} due on ${date}.`,
                            html: `<p>Dear ${student.name},</p>
                                   <p>You have a payment of <strong>${dueAmount}</strong> due on <strong>${date}</strong>.</p>
                                   <p>Please ensure that the payment is made before the due date to avoid penalties.</p>`
                        });

                        emailPromises.push(emailPromise);
                    }
                });
            });

            await Promise.all(emailPromises);
            console.log('Successfully sent payment due reminder emails.');
            return null;
        } catch (error) {
            console.error('Error sending payment due reminders: ', error);
            return null;
        }
    });