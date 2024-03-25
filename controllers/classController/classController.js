const Class = require('../../models/class');
const Course = require('../../models/course');
const Session = require('../../models/session');
/*

module.exports = {
    async createClass(req, res) {
        try {
          const classData = req.body;
          const newClass = new classes(classData);
          await newClass.save();
          res.status(201).json(newClass);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      },

      async getAllClasses(req, res) {
        try {
            const classe = await classes.find();
            res.status(200).json(classe);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async getClassById(req, res) {
        try {
            const classe = await classes.findById(req.params.id);
            if (!classe) {
                return res.status(404).json({ message: 'Class not found' });
            }
            res.status(200).json(classe);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async updateClass(req, res) {
        try {
            const updatedClass = await classes.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedClass) {
                return res.status(404).json({ message: 'Class not found' });
            }
            res.status(200).json(updatedClass);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async deleteClass(req, res) {
        try {
            const deletedClass = await classes.findByIdAndDelete(req.params.id);
            if (!deletedClass) {
                return res.status(404).json({ message: 'Class not found' });
            }
            res.status(200).json({ message: 'Class deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
   
          
  };
*/
exports.createClass = async (req, res) => {
    try {
        const newClass = new Class(req.body);
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (error) {
        res.status(400).json({ message: "Failed to create class", error: error.message });
    }
};

exports.getClass = async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id).populate('teacher').populate('students');
        if (!classData) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.json(classData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateClass = async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedClass);
    } catch (error) {
        res.status(400).json({ message: "Failed to update class", error: error.message });
    }
};

exports.deleteClass = async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.json({ message: 'Class successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.listClasses = async (req, res) => {
    try {
        const classes = await Class.find().populate('teacher').populate('students');
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getClassesByCourseId = async (req, res) => {
    try {
        const { courseId } = req.query;
        const classes = await Class.find({ courseId }).populate('teacher');
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch classes by course ID", error: error.message });
    }
};



exports.generateClassesForCourse = async (req, res) => {
    try {
        const { courseId, maxStudentsPerClass } = req.body;
        const course = await Course.findById(courseId).populate('students');

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Determine the number of classes needed, at least 1
        const numberOfClasses = Math.max(1, Math.ceil(course.students.length / maxStudentsPerClass));
        let classesCreated = [];

        for (let i = 0; i < numberOfClasses; i++) {
            // Slice the students array to get students for this class
            const studentsForClass = course.students.slice(i * maxStudentsPerClass, (i + 1) * maxStudentsPerClass);
            const newClass = new Class({
                name: `Class ${i + 1}`,
                courseId: course._id,
                students: studentsForClass.map(student => student._id),
            });
            const savedClass = await newClass.save();
            classesCreated.push(savedClass);
        }

        res.status(201).json(classesCreated);
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate classes', error: error.message });
    }
};

exports.updateClassSchedule = async (req, res) => {
    const { classId, start, end, teacherId } = req.body;
    try {
        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            {
                start: new Date(start),
                end: new Date(end),
                teacher: teacherId
            },
            { new: true }
        );
        if (!updatedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.status(200).json(updatedClass);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update class schedule', error: error.message });
    }
};
exports.assignTeachersToClass = async (req, res) => {
    const { classId } = req.params;
    const { teacherIds } = req.body;

    try {
        const classToUpdate = await Class.findById(classId);

        if (!classToUpdate) {
            return res.status(404).json({ message: 'Class not found' });
        }

        classToUpdate.teacher = teacherIds;

        await classToUpdate.save();

        res.status(200).json({ message: 'Teachers assigned successfully', class: classToUpdate });
    } catch (error) {
        res.status(500).json({ message: 'Failed to assign teachers', error });
    }
};

exports.getTeachersByClassId = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Class.findById(classId).populate('teacher');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course.teacher);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teachers', error });
    }
};
exports.createSessionForClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { teacherId, date, startTime, endTime } = req.body;

        const foundClass = await Class.findById(classId);
        if (!foundClass) {
            return res.status(404).json({ message: "Class not found" });
        }

        const newSession = new Session({
            date,
            startTime: new Date(date + 'T' + startTime),
            endTime: new Date(date + 'T' + endTime),
            teacher: teacherId
        });

        const savedSession = await newSession.save();

        foundClass.sessions.push(savedSession._id);
        await foundClass.save();

        res.status(201).json({ message: "Session created and added to the class successfully", session: savedSession });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create session', error: error.message });
    }
};


exports.getUpcomingSessionsForTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const currentDate = new Date();

        const nextSession = await Session.findOne({
            teacher: teacherId,
            startTime: { $gte: currentDate }
        }).populate('classId').sort('startTime');

        if (nextSession) {
            res.status(200).json(nextSession);
        } else {
            res.status(404).json({ message: "No upcoming sessions found for this teacher" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve the next session', error: error.message });
    }
};

exports.markAttendance = async (req, res) => {
    try {
        const { sessionId, studentId, status } = req.body;

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        const attendanceIndex = session.attendance.findIndex(att => att.student.toString() === studentId);
        if (attendanceIndex > -1) {
            session.attendance[attendanceIndex].status = status;
        } else {
            session.attendance.push({ student: studentId, status: status });
        }

        await session.save();
        res.status(200).json({ message: "Attendance marked successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
    }
};

exports.addStudentsToClass = async (req, res) => {
    const { classId } = req.params;
    const { studentIds } = req.body;

    try {
        const classToUpdate = await Class.findById(classId);
        if (!classToUpdate) {
            return res.status(404).json({ message: "Class not found" });
        }

        // Merge the existing student IDs with the new ones
        // Make sure there are no duplicate entries
        const updatedStudentIds = [...new Set([...classToUpdate.students.map(id => id.toString()), ...studentIds])];

        classToUpdate.students = updatedStudentIds;
        await classToUpdate.save();

        res.status(200).json({ message: "Students added successfully", class: classToUpdate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add students to class', error: error.message });
    }
};

