const Person = require('../models/person');

const registerPerson = async (req, res) => {
    const { name, facialScanId } = req.body;
    let avatarPath = null;
    if (req.file) {
        avatarPath = `/avatars/${req.file.filename}`;
    }
    try {
        const newPerson = new Person({
            name,
            facialScanId,
            avatarPath: avatarPath,
            quarantineStatus: 'Pre-Quarantine',
            runValidators: true
        });
        await newPerson.save();
        res.status(201).json(newPerson);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const enterSanitizeFacility = async (req, res) => {
    const { facialScanId } = req.body;
    try {
        const person = await Person.findOne({ facialScanId });
        if (!person) {
            return res.status(404).json({ message: 'Person not found.' });
        }
        person.entryLog.push({ facility: 'Sanitize Facility', action: 'Enter' });
        await person.save();
        res.status(200).json({ message: 'Entered Sanitize Facility', person });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const startQuarantine = async (req, res) => {
    const { facialScanId } = req.body;
    try {
        const person = await Person.findOne({ facialScanId });
        if (!person) {
            return res.status(404).json({ message: 'Person not found.' });
        }
        if (person.quarantineStatus === 'Pre-Quarantine') {
            person.quarantineStatus = 'In-Quarantine';
            person.quarantineStartTime = new Date();
            person.quarantineEndTime = new Date(person.quarantineStartTime.getTime() + (2 * 24 * 60 * 60 * 1000));
            person.entryLog.push({ facility: 'Quarantine', action: 'Enter' });
            await person.save();
            res.status(200).json({ message: 'Quarantine started.', person });
        } else {
            res.status(400).json({ message: 'Person is not in Pre-Quarantine status.' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPersonDetails = async (req, res) => {
    try {
        const person = await Person.findOne({ facialScanId: req.params.facialScanId });
        if (!person) {
            return res.status(404).json({ message: 'Person not found.' });
        }
        res.status(200).json(person);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    registerPerson,
    enterSanitizeFacility,
    startQuarantine,
    getPersonDetails
};
