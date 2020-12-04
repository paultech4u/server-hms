import "babel-polyfill";
import sinon from "sinon";
import { connect, disconnect } from "mongoose";

import { User } from "../../../model/user";
import { Hospital } from "../../../model/hospital";
import { Department } from "../../../model/department";
import { signUp } from "../user";

jest.mock("@sendgrid/mail");

describe("User controller", function () {
  describe("POST signup", function () {
    beforeAll(async function () {
      await connect(
        "mongodb+srv://paultech4u:6XumontAcdaJHCug@cluster0.l6grh.mongodb.net/HMS-test?retryWrites=true&w=majority",
        { useUnifiedTopology: true, useNewUrlParser: true }
      );

      const hospital = new Hospital({
        name: "testHospital",
        email: "email",
        state: "abj",
        address: "lag",
      });
      const department = new Department({
        name: "testDepartment",
        description: "description",
        isActive: true,
      });
      const user = new User({
        email: "test@email.com",
        name: {
          first: "test",
          middle: "testM",
          sur: "test",
        },
        username: "testM",
        password: "58jdl43455",
        tel: "4093456677",
      });
      await Promise.all([hospital.save(), department.save(), user.save()]);
    });
    test("should throw an error if accessing the database fails", async function () {
      sinon.stub(Hospital, "findOne");
      sinon.stub(Department, "findOne");
      Hospital.findOne.throws();
      Department.findOne.throws();
      const req = {
        body: {
          hospital: "testHospital",
          department: "testDepartment",
        },
      };
      const res = await signUp(req, {}, () => {});
      expect(res).toHaveProperty("status", 500);
      Hospital.findOne.restore();
      Department.findOne.restore();
    });
    afterAll(async function () {
      await Hospital.deleteMany({});
      await Department.deleteMany({});
      await User.deleteMany({});
      return disconnect();
    });
  });
});
