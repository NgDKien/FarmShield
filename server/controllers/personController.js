const Person = require('../models/person');
<<<<<<< HEAD
=======
const { setupSSEConnection, sendEvent } = require('../manager/sseManager'); // Import SSE functions
>>>>>>> origin/yolo_tracking

const registerPerson = async (req, res) => {
    const { name, facialScanId } = req.body;
    let avatarPath = null;
    if (req.file) {
<<<<<<< HEAD
        avatarPath = `/avatars/${req.file.filename}`;
=======
        avatarPath = `people/avatars/${req.file.filename}`;
>>>>>>> origin/yolo_tracking
    }
    try {
        const newPerson = new Person({
            name,
            facialScanId,
            avatarPath: avatarPath,
            quarantineStatus: 'Pre-Quarantine',
<<<<<<< HEAD
=======
            SanitizeLog: {
                clothChange: false,
                handWashing: false
            },
>>>>>>> origin/yolo_tracking
            runValidators: true
        });
        await newPerson.save();
        res.status(201).json(newPerson);
    } catch (err) {
        res.status(400).json({ message: err.message });
        console.log("error at registerting new person: " + err.message);
    }
};

const enterSanitizeFacility = async (req, res) => {
    const { facialScanId } = req.body;
    try {
        const person = await Person.findOne({ facialScanId });
        if (!person) {
            return res.status(404).json({ message: 'Person not found.' });
        }
<<<<<<< HEAD
=======
         
        // Check if person is already in Sanitize Facility
        const lastEntry = person.entryLog.filter(log => log.facility === 'Sanitize Facility').pop();
        const lastEntryQ = person.entryLog.filter(log => log.facility === 'Quarantine Facility').pop();
        if (lastEntry && lastEntry.action === 'Enter') {
            return res.status(200).json({ message: 'Person is already in Sanitize Facility.' });
        } else if (lastEntryQ && lastEntryQ.action === 'Enter') {
            return res.status(200).json({ message: 'Person is already in Quarantine Facility.' });
        }
        
>>>>>>> origin/yolo_tracking
        person.entryLog.push({ facility: 'Sanitize Facility', action: 'Enter' });
        await person.save();
        res.status(200).json({ message: 'Entered Sanitize Facility', person });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const startQuarantine = async (req, res) => {
<<<<<<< HEAD
    const { facialScanId } = req.body;
    try {
        const person = await Person.findOne({ facialScanId });
=======
    const { personId } = req.body;
    try {
        const person = await Person.findOne({ personId });
>>>>>>> origin/yolo_tracking
        if (!person) {
            return res.status(404).json({ message: 'Person not found.' });
        }
        if (person.quarantineStatus === 'Pre-Quarantine') {
<<<<<<< HEAD
=======
            // Check if person is already in Quarantine Facility
            const lastEntry = person.entryLog.filter(log => log.facility === 'Quarantine Facility').pop();
            if (lastEntry && lastEntry.action === 'Enter') {
                return res.status(400).json({ message: 'Person is already in Quarantine Facility.' });
            }
            
>>>>>>> origin/yolo_tracking
            person.quarantineStatus = 'In-Quarantine';
            person.quarantineStartTime = new Date();
            person.quarantineEndTime = new Date(person.quarantineStartTime.getTime() + (2 * 24 * 60 * 60 * 1000));
            person.entryLog.push({ facility: 'Quarantine Facility', action: 'Enter' });
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
        const person = await Person.findOne({ personId: req.params.personId });
        if (!person) {
            return res.status(404).json({ message: 'Person not found.' });
        }
        res.status(200).json(person);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

<<<<<<< HEAD
// Query //

=======
>>>>>>> origin/yolo_tracking
const getAllInQuarantine = async (req, res) => {
  try {
    const persons = await Person.find({
      quarantineStatus: { $in: ['In-Quarantine', 'Pre-Quarantine'] }
    });

    if (!persons || persons.length === 0) {
      return res.status(404).json({ message: 'No persons found in quarantine.' });
    }

    res.status(200).json(persons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

<<<<<<< HEAD
=======
const getAllInPreQuarantine = async (req, res) => {
  try {
    const persons = await Person.find({
      quarantineStatus: { $in: ['Pre-Quarantine'] }
    });

    if (!persons || persons.length === 0) {
      return res.status(404).json({ message: 'No persons found in Pre-Quarantine.' });
    }

    res.status(200).json(persons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const exitSanitizeFacility = async (req, res) => {
    const { personId } = req.body;
    try {
        const person = await Person.findOne({ personId });
        if (!person) {
            return res.status(404).json({ message: 'Person not found.' });
        }
        
        // Check if person is actually in Sanitize Facility
        const lastEntry = person.entryLog.filter(log => log.facility === 'Sanitize Facility').pop();
        if (!lastEntry || lastEntry.action !== 'Enter') {
            return res.status(400).json({ message: 'Person is not in Sanitize Facility.' });
        }
        
        person.entryLog.push({ facility: 'Sanitize Facility', action: 'Exit' });
        await person.save();
        res.status(200).json({ message: 'Exited Sanitize Facility', person });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const exitQuarantine = async (req, res) => {
    const { personId } = req.body;
    try {
        const person = await Person.findOne({ personId });
        if (!person) {
            return res.status(404).json({ message: 'Person not found.' });
        }
        
        // Check if person is actually in Quarantine Facility
        if (person.quarantineStatus !== 'In-Quarantine') {
            return res.status(400).json({ message: 'Person is not in Quarantine.' });
        }
        
        const lastEntry = person.entryLog.filter(log => log.facility === 'Quarantine Facility').pop();
        if (!lastEntry || lastEntry.action !== 'Enter') {
            return res.status(400).json({ message: 'Person is not in Quarantine Facility.' });
        }
        
        person.quarantineStatus = 'Quarantine-Complete';
        person.entryLog.push({ facility: 'Quarantine Facility', action: 'Exit' });
        await person.save();
        res.status(200).json({ message: 'Exited Quarantine Facility', person });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateClothChangeStatus = async (req, res) => {
    const { personId, clothChange } = req.body;
    try {
        const person = await Person.findOne({ personId });
        if (!person) {
            return res.status(404).json({ message: 'Person not found.' });
        }
        sendEvent({ status: "update", message: `update command for client.` });
        // Update only the clothChange status
        person.SanitizeLog.clothChange = clothChange;
        
        await person.save();
        res.status(200).json({ message: 'Cloth change status updated successfully', person });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateHandWashingStatus = async (req, res) => {
    const { personId, handWashing } = req.body;
    try {
        const person = await Person.findOne({ personId });
        if (!person) {
            return res.status(404).json({ message: 'Person not found.' });
        }
        sendEvent({ status: "update", message: `update command for client.` });
        // Update only the handWashing status
        person.SanitizeLog.handWashing = handWashing;
        
        await person.save();
        res.status(200).json({ message: 'Hand washing status updated successfully', person });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

>>>>>>> origin/yolo_tracking

module.exports = {
    registerPerson,
    enterSanitizeFacility,
<<<<<<< HEAD
    startQuarantine,
    getPersonDetails,
    // Query //
    getAllInQuarantine
=======
    exitSanitizeFacility,
    startQuarantine,
    exitQuarantine,
    getPersonDetails,
    getAllInQuarantine,
    getAllInPreQuarantine,
    updateClothChangeStatus,
    updateHandWashingStatus
>>>>>>> origin/yolo_tracking
};
