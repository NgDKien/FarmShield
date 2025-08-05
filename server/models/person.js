const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const EntryLogSchema = new mongoose.Schema({
    facility: {
        type: String,
        required: true,
        enum: ['Sanitize Facility', 'Quarantine']
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
    warning: {
        type: String,
        default: null
    },
    entryLog: [EntryLogSchema]
});

module.exports = mongoose.model('Person', PersonSchema);

