import { useState } from "react";
import UniversityCard from "../../components/interview/UniversityCard";
import CourseInput from "../../components/interview/CourseInput";
import InterviewFormat from "../../components/interview/InterviewFormat";
import DocumentUpload from "../../components/interview/DocumentUpload";
import UploadedFile from "../../components/interview/UploadFile";
import ContinueButton from "../../components/interview/ContinueInterview";

function SetupInterview() {
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const [course, setCourse] = useState("");
    const [format, setFormat] = useState("Panel");
    const [file, setFile] = useState(null);

    const universities = [
        {
            id: 1,
            code: "UCL",
            name: "University College London",
            city: "London",
        },
        {
            id: 2,
            code: "LDS",
            name: "University of Leeds",
            city: "Leeds",
        },
        {
            id: 3,
            code: "MAN",
            name: "University of Manchester",
            city: "Manchester",
        },
        {
            id: 4,
            code: "EDI",
            name: "University of Edinburgh",
            city: "Edinburgh",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-10">
            <div className="max-w-7xl mx-auto">

                {/* Header */}

                <div className="mb-10">
                    <h1 className="text-5xl font-bold text-gray-900">
                        Set up your interview
                    </h1>

                    <p className="mt-3 text-lg text-gray-500">
                        Pick your university, tell us the course, and add any documents.
                    </p>
                </div>

                {/* Main Grid */}

                <div className="grid grid-cols-12 gap-8">

                    {/* Left */}

                    <div className="col-span-7">

                        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-5">
                            1 • Choose University
                        </h2>

                        <div className="grid grid-cols-2 gap-5">

                            {universities.map((uni) => (
                                <UniversityCard
                                    key={uni.id}
                                    code={uni.code}
                                    name={uni.name}
                                    city={uni.city}
                                    selected={selectedUniversity === uni.id}
                                    onClick={() => setSelectedUniversity(uni.id)}
                                />
                            ))}

                        </div>

                    </div>

                    {/* Right */}

                    <div className="col-span-5 rounded-3xl bg-white border border-gray-200 shadow-sm p-8">

                        <CourseInput
                            value={course}
                            onChange={setCourse}
                        />

                        <div className="mt-8">

                            <InterviewFormat
                                value={format}
                                onChange={setFormat}
                            />

                        </div>

                        <div className="mt-8">

                            <DocumentUpload
                                onFileChange={setFile}
                            />

                        </div>
                        {file && (
                            <div className="mt-6">
                                <UploadedFile file={file} />
                            </div>
                        )}

                        <div className="mt-8">
                            <ContinueButton />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default SetupInterview;