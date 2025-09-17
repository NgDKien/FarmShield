const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const EntryLogSchema = new mongoose.Schema({
    facility: {
        type: String,
        required: true,
        enum: ['Sanitize Facility', 'Quarantine Facility']
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    action: {
        type: String,
        required: true,
        enum: ['Enter', 'Exit']
    }
})

<<<<<<< HEAD
=======
const SanitizeLogSchema = new mongoose.Schema({
    clothChange:{
        type: Boolean,
        required: true,
        default: false
    },
    handWashing:{
        type: Boolean,
        required: true,
        default: false
    }
})

>>>>>>> origin/yolo_tracking
const PersonSchema = new mongoose.Schema({
    personId: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4
    },
    avatarPath: {
        type: String,
        required: false,
        unique: true,
        default: uuidv4
    },
    name: {
        type: String,
        required: true,
        default: "Guest"
    },
    facialScanId: {
        type: String,
        required: true,
        unique: true
    },
    quarantineStatus: {
        type: String,
        required: true,
        enum: ['Pre-Quarantine', 'In-Quarantine', 'Quarantine-Complete'],
        default: 'Pre-Quarantine'
    },
    quarantineStartTime: {
        type: Date,
        required: false,
        default: null
    },
    quarantineEndTime: {
        type: Date,
        default: null
    },
<<<<<<< HEAD
    warning: {
        type: String,
        default: null
    },
    entryLog: [EntryLogSchema]
});

=======
    SanitizeLog:SanitizeLogSchema,
    entryLog: [EntryLogSchema]
}, {
    // Explicitly control index creation to prevent accidental unique indexes
    autoIndex: false
});

// Explicitly define only the indexes we want
PersonSchema.index({ personId: 1 }, { unique: true });
PersonSchema.index({ facialScanId: 1 }, { unique: true });
PersonSchema.index({ avatarPath: 1 }, { unique: true });

>>>>>>> origin/yolo_tracking
module.exports = mongoose.model('Person', PersonSchema);

