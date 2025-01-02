import bcrypt from "bcrypt";
import teacherModel from "../../../models/teacher.js";
import httpError from "../../../utils/httpError.js";
import subjectModel from "../../../models/subject.js";

/** Create Teacher */

export const createTeacher = async (req, res, next) => {

  try {

    const { first_name, last_name, email, password, address, gender, dob, phone, subject } = req.body;

    let profile_image;

    if (req.file && req.file.path) {
      profile_image = req.file.path.slice(8);
    }

    function calculateAge(dob) {
      const today = new Date();
      const birthDate = new Date(dob);
      let ageCalculate = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        ageCalculate--;
      }

      return ageCalculate;
    }

    if ( !first_name || !last_name || !email || !password || !address || !gender || !dob || !phone || !subject) {

      return next(new httpError("All fields are mantatory", 400));
    }

    const existingteacher = await teacherModel.findOne({ $or: [{ email }, { phone }], "is_deleted.status": false });

    if (existingteacher) {

      return next( new httpError( "A teacher with this email or this Phone Number is already exists", 404 ));
    }

    const subjectArray = Array.isArray(subject) ? subject : [subject];


    const subjectData = await subjectModel.find({ 
        $and: [
            { _id: { $in: subjectArray } }, 
            { "is_deleted.status": false }
        ] 
    })

    if (subjectData.length !== subjectArray.length) {

        return next(new httpError("One or more subjects not found", 400));
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!emailRegex.test(email)) {

      return next(new httpError("Invalid email format", 404));
    }

    const validatePassword = (password) => {

      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

      return regex.test(password);
    };

    if (!validatePassword(password)) {

      return next(new httpError("Password must be at least 6 characters long, include at least one uppercase letter, one number, and one special character",404));
    }

    const validatePhoneNumber = (phone) => {
      return /^\d{10}$/.test(phone?.toString());
    };

    if (!validatePhoneNumber(phone)) {
      return next(new httpError("Phone number must be exactly 10 digits", 404));
    }

    const saltRounds = process.env.SALT_VALUE ? parseInt(process.env.SALT_VALUE): 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newTeacher = new teacherModel({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      address,
      gender,
      dob,
      age: calculateAge(dob),
      phone,
      profile_image,
      subject: subjectArray,
    });

    await newTeacher.save();

    res.status(201).json({
      message: `${newTeacher.first_name + " " + newTeacher.last_name} (Teacher) created successfully`,
      data: null,
      status: true,
      access_token: null,
    });

  } catch (error) {

    if (error.name === "ValidationError") {

      const errorMessage = Object.values(error.errors).map((err) => err.message);
      return next(new httpError(errorMessage.join(","), 400));
    }

    return next(new httpError("Failed to Upload Teacher Data. Please try again later",500));
  }

};

/** list all teacher */

export const listTeachers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const startIndex = (page - 1) * limit;
    const searchQuery = req.query.search || "";
    const statusFilter = req.query.status || "";

    const searchRegex = new RegExp(searchQuery, "i");

    const filter = {
      "is_deleted.status": false,
      $or: [
        { first_name: { $regex: searchRegex } },
        { last_name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
      ],
    };

    if (statusFilter) {
      filter.status = statusFilter;
    }

    const total = await teacherModel.countDocuments(filter);

    const teachers = await teacherModel
      .find(filter)
      .select("-is_deleted -password")
      .populate({
        path: "subject",
        select: "-is_deleted",
        populate: [
          {
            path: "created_by",
            select: "first_name last_name email role status profile_image",
          },

          {
            path: "updated_by",
            select: "first_name last_name email role status profile_image",
          },
        ],
      })
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "",
      data: teachers,
      status: true,
      access_token: null,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(
      new httpError("Failed to get teachers list. Please try again later", 500)
    );
  }
};

/** get One teacher */

export const getOneTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new httpError("Teacher ID required", 400));
    }

    const teacher = await teacherModel
      .findOne({ _id: id })
      .select("-password -is_deleted")
      .populate({
        path: "subject",
        select: "name created_by updated_by",
        populate: [
          {
            path: "created_by",
            select: "first_name last_name email role status profile_image",
          },

          {
            path: "updated_by",
            select: "first_name last_name email role status profile_image",
          },
        ],
      });

    if (!teacher) {
      return next(new httpError("Teacher Not Found", 404));
    }

    res.status(200).json({
      message: "",
      data: teacher,
      status: true,
      access_token: null,
    });
  } catch (error) {
    return next(
      new httpError("Failed to get teacher . Please try again later", 500)
    );
  }
};

/** Update Teacher  */

export const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new httpError("Teacher ID required", 400));
    }

    const {
      first_name,
      last_name,
      email,
      password,
      gender,
      dob,
      phone,
      status,
      subject,
      address,
    } = req.body;

    let profileImage;

    if (req.file && req.file.path) {
      profileImage = req.file.path.slice(8);
    }

    function calculateAge(dob) {
      const today = new Date();
      const birthDate = new Date(dob);

      let ageCalculate = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        ageCalculate--;
      }

      return ageCalculate;
    }

    const teacherData = {
      first_name,
      last_name,
      email,
      password,
      gender,
      dob,
      phone,
      status,
      subject,
      address,
    };

    if (profileImage) {
      teacherData.profile_image = profileImage;
    }

    if (req.body.dob) {
      teacherData.age = calculateAge(dob);
    }

    if (req.body.subject) {
      const subjectArray = Array.isArray(subject) ? subject : [subject];

      const subjectData = await subjectModel.find({
        $and: [{ _id: { $in: subjectArray } }, { "is_deleted.status": false }],
      });

      if (subjectData.length !== subjectArray.length) {
        return next(new httpError("One or more subjects not found", 404));
      }
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (req.body.email && !emailRegex.test(email)) {
      return next(new httpError("Invalid email format!", 400));
    }

    const validatePassword = (password) => {
      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      return regex.test(password);
    };

    if (req.body.password && !validatePassword(password)) {
      return next(
        new httpError(
          "Password must be at least 6 characters long, include at least one uppercase letter, one number, and one special character",
          400
        )
      );
    }

    const validatePhoneNumber = (phone) => {
      return /^\d{10}$/.test(phone?.toString());
    };

    if (req.body.phone && !validatePhoneNumber(phone)) {
      return next(new httpError("Phone number must be exactly 10 digits", 400));
    }

    if (req.body.password) {
      const saltRounds = process.env.SALT_VALUE
        ? parseInt(process.env.SALT_VALUE)
        : 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      teacherData.password = hashedPassword;
    }

    const existingteacher = await teacherModel.findOne({
      $or: [{ email }, { phone }],
      _id: { $ne: id },
    });

    if (existingteacher) {
      return next(
        new httpError(
          "A Teacher with this email or this Phone Number is already exists",
          409
        )
      );
    }

    const teacher = await teacherModel.findOneAndUpdate(
      { _id: id },
      { $set: teacherData },
      { new: true, runValidators: true }
    );

    if (teacher) {
      res.status(200).json({
        message: `${
          teacher.first_name + " " + teacher.last_name
        } (Teacher) Updated successfully`,
        data: null,
        status: true,
        access_token: null,
      });
    } else {
      return next(new httpError("Teacher Not found", 404));
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessage = Object.values(error.errors).map(
        (err) => err.message
      );
      return next(new httpError(errorMessage.join(", "), 400));
    }

    return next(
      new httpError("Failed to Update teacher . Please try again later", 500)
    );
  }
};

/** Delete Teacher */

export const deleteTeacher = async (req, res, next) => {

  try {

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {

      return next(new httpError("Teacher ID is required", 400));
    }

    const adminID = req.user?.id;

    if (!adminID) {

      return next(new httpError("Unauthorized action", 403));
    }

    const teacher = await teacherModel.updateMany(
      { _id: { $in: ids }, "is_deleted.status": false },

      {
        $set: {
          "is_deleted.status": true,
          "is_deleted.deleted_by": adminID,
          "is_deleted.deleted_at": new Date(),
        },
      },

      { new: true }
    );

    if (teacher.matchedCount === 0) {

      return next(new httpError("No Teacher found or already deleted", 404));
    }

    res.status(200).json({
      message: "Teacher deleted successfully",
      data: null,
      status: true,
      access_token: null,
    });

  } catch (error) {

    return next(new httpError("Failed to delete Teacher. Please try again later", 500));
  }
  
};
