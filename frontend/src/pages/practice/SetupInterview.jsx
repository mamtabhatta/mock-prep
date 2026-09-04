import {
    useEffect,
    useState,
} from "react";

import UniversityCard from "../../components/practice/UniversityCard";

import CourseInput from "../../components/practice/CourseInput";

import InterviewFormat from "../../components/practice/InterviewFormat";

import DocumentUpload from "../../components/practice/DocumentUpload";

import UploadedFile from "../../components/practice/UploadFile";

import ContinueButton from "../../components/practice/ContinueInterview";

import api from "../../api/api";


function SetupInterview() {

    const [universities, setUniversities] =
        useState([]);

    const [courses, setCourses] =
        useState([]);

    const [questionSets, setQuestionSets] =
        useState([]);


    const [selectedUniversity, setSelectedUniversity] =
        useState(null);

    const [selectedCourse, setSelectedCourse] =
        useState("");

    const [selectedQuestionSet, setSelectedQuestionSet] =
        useState("");


    const [format, setFormat] =
        useState("Panel");

    const [file, setFile] =
        useState(null);


    const [loading, setLoading] =
        useState(true);

    const [loadingCourses, setLoadingCourses] =
        useState(false);

    const [loadingQuestionSets, setLoadingQuestionSets] =
        useState(false);


    const [error, setError] =
        useState("");


    // ============================================
    // FETCH UNIVERSITIES
    // ============================================

    useEffect(() => {

        const fetchUniversities =
            async () => {

                try {

                    setLoading(true);

                    setError("");


                    const response =
                        await api.get(
                            "/universities"
                        );


                    setUniversities(
                        response.data.data || []
                    );

                } catch (error) {

                    console.error(
                        "Failed to fetch universities:",
                        error
                    );


                    setError(
                        error.response?.data?.error
                            ?.message ||
                        error.response?.data?.message ||
                        "Failed to load universities."
                    );

                } finally {

                    setLoading(false);

                }

            };


        fetchUniversities();

    }, []);


    // ============================================
    // FETCH COURSES
    // ============================================

    useEffect(() => {

        if (!selectedUniversity) {

            setCourses([]);

            setSelectedCourse("");

            setQuestionSets([]);

            setSelectedQuestionSet("");

            return;

        }


        const fetchCourses =
            async () => {

                try {

                    setLoadingCourses(true);

                    setError("");


                    const response =
                        await api.get(
                            `/courses?universityId=${selectedUniversity}`
                        );


                    const courseData =
                        response.data.data || [];


                    setCourses(
                        courseData
                    );


                    setSelectedCourse("");

                    setQuestionSets([]);

                    setSelectedQuestionSet("");

                } catch (error) {

                    console.error(
                        "Failed to fetch courses:",
                        error
                    );


                    setError(
                        error.response?.data?.error
                            ?.message ||
                        error.response?.data?.message ||
                        "Failed to load courses."
                    );

                } finally {

                    setLoadingCourses(false);

                }

            };


        fetchCourses();

    }, [
        selectedUniversity,
    ]);


    // ============================================
    // FETCH QUESTION SETS
    // ============================================

    useEffect(() => {

        if (!selectedCourse) {

            setQuestionSets([]);

            setSelectedQuestionSet("");

            return;

        }


        const fetchQuestionSets =
            async () => {

                try {

                    setLoadingQuestionSets(
                        true
                    );

                    setError("");


                    const response =
                        await api.get(
                            `/question-sets?courseId=${selectedCourse}`
                        );


                    const sets =
                        response.data.data || [];


                    const activeSets =
                        sets.filter(
                            (set) =>
                                set.isActive
                        );


                    setQuestionSets(
                        activeSets
                    );


                    if (
                        activeSets.length > 0
                    ) {

                        setSelectedQuestionSet(
                            activeSets[0].id
                        );

                    } else {

                        setSelectedQuestionSet(
                            ""
                        );

                    }

                } catch (error) {

                    console.error(
                        "Failed to fetch question sets:",
                        error
                    );


                    setError(
                        error.response?.data?.error
                            ?.message ||
                        error.response?.data?.message ||
                        "Failed to load question sets."
                    );

                } finally {

                    setLoadingQuestionSets(
                        false
                    );

                }

            };


        fetchQuestionSets();

    }, [
        selectedCourse,
    ]);


    // ============================================
    // UI
    // ============================================

    return (

        <div className="
            min-h-screen
            bg-slate-50
            px-6
            py-8
            transition-colors
            duration-300
            dark:bg-slate-950
        ">

            <div className="
                mx-auto
                max-w-6xl
            ">


                <div className="
                    mb-8
                ">

                    <h1 className="
                        text-2xl
                        font-semibold
                        tracking-tight
                        text-slate-900
                        dark:text-white
                        sm:text-3xl
                    ">
                        Set up your interview
                    </h1>


                    <p className="
                        mt-2
                        text-sm
                        text-slate-500
                        dark:text-slate-400
                    ">
                        Choose your university, select your course,
                        and upload any relevant documents.
                    </p>

                </div>


                <div className="
                    grid
                    grid-cols-1
                    gap-6
                    lg:grid-cols-12
                ">


                    {/* ======================================
                        UNIVERSITIES
                    ====================================== */}

                    <div className="
                        lg:col-span-7
                    ">

                        <div className="
                            mb-4
                            flex
                            items-center
                            gap-3
                        ">

                            <span className="
                                flex
                                h-6
                                w-6
                                items-center
                                justify-center
                                rounded-full
                                bg-slate-900
                                text-xs
                                font-semibold
                                text-white
                                dark:bg-white
                                dark:text-slate-900
                            ">
                                1
                            </span>


                            <h2 className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wider
                                text-slate-500
                                dark:text-slate-400
                            ">
                                Choose University
                            </h2>

                        </div>


                        {loading && (

                            <div className="
                                grid
                                grid-cols-1
                                gap-4
                                sm:grid-cols-2
                            ">

                                {[1, 2, 3, 4].map(
                                    (item) => (

                                        <div
                                            key={item}
                                            className="
                                                h-32
                                                animate-pulse
                                                rounded-xl
                                                border
                                                border-slate-200
                                                bg-white
                                                dark:border-slate-800
                                                dark:bg-slate-900
                                            "
                                        />

                                    )
                                )}

                            </div>

                        )}


                        {!loading &&
                            error && (

                                <div className="
                                    rounded-xl
                                    border
                                    border-red-200
                                    bg-red-50
                                    p-4
                                    text-sm
                                    text-red-600
                                    dark:border-red-900/50
                                    dark:bg-red-950/30
                                    dark:text-red-400
                                ">
                                    {error}
                                </div>

                            )}


                        {!loading &&
                            !error && (

                                <div className="
                                    grid
                                    grid-cols-1
                                    gap-4
                                    sm:grid-cols-2
                                ">

                                    {universities.map(
                                        (
                                            university
                                        ) => (

                                            <UniversityCard
                                                key={
                                                    university.id
                                                }

                                                code={
                                                    university.name
                                                        .substring(
                                                            0,
                                                            3
                                                        )
                                                        .toUpperCase()
                                                }

                                                name={
                                                    university.name
                                                }

                                                city={
                                                    university.country
                                                }

                                                selected={
                                                    selectedUniversity ===
                                                    university.id
                                                }

                                                onClick={() =>
                                                    setSelectedUniversity(
                                                        university.id
                                                    )
                                                }
                                            />

                                        )
                                    )}

                                </div>

                            )}

                    </div>


                    {/* ======================================
                        INTERVIEW DETAILS
                    ====================================== */}

                    <div className="
                        lg:col-span-5
                    ">

                        <div className="
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            p-6
                            shadow-sm
                            dark:border-slate-800
                            dark:bg-slate-900
                        ">


                            <div className="
                                mb-6
                                border-b
                                border-slate-100
                                pb-5
                                dark:border-slate-800
                            ">

                                <h2 className="
                                    text-sm
                                    font-semibold
                                    text-slate-900
                                    dark:text-white
                                ">
                                    Interview details
                                </h2>


                                <p className="
                                    mt-1
                                    text-xs
                                    text-slate-500
                                    dark:text-slate-400
                                ">
                                    Complete the details below to continue.
                                </p>

                            </div>


                            {/* COURSE */}

                            {loadingCourses ? (

                                <div className="
                                    rounded-lg
                                    bg-slate-100
                                    p-3
                                    text-sm
                                    text-slate-500
                                    dark:bg-slate-800
                                    dark:text-slate-400
                                ">
                                    Loading courses...
                                </div>

                            ) : (

                                <select
                                    value={
                                        selectedCourse
                                    }

                                    onChange={(e) =>
                                        setSelectedCourse(
                                            e.target.value
                                        )
                                    }

                                    disabled={
                                        !selectedUniversity
                                    }

                                    className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-slate-300
                                        bg-white
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-slate-900
                                        outline-none
                                        focus:border-blue-500
                                        dark:border-slate-700
                                        dark:bg-slate-800
                                        dark:text-white
                                    "
                                >

                                    <option value="">

                                        {!selectedUniversity
                                            ? "Select university first"
                                            : "Select course"}

                                    </option>


                                    {courses.map(
                                        (
                                            item
                                        ) => (

                                            <option
                                                key={
                                                    item.id
                                                }
                                                value={
                                                    item.id
                                                }
                                            >
                                                {item.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            )}


                            {/* QUESTION SET */}

                            {selectedCourse && (

                                <div className="
                                    mt-4
                                ">

                                    <select
                                        value={
                                            selectedQuestionSet
                                        }

                                        onChange={(e) =>
                                            setSelectedQuestionSet(
                                                e.target.value
                                            )
                                        }

                                        disabled={
                                            loadingQuestionSets
                                        }

                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            bg-white
                                            px-3
                                            py-2.5
                                            text-sm
                                            text-slate-900
                                            outline-none
                                            focus:border-blue-500
                                            dark:border-slate-700
                                            dark:bg-slate-800
                                            dark:text-white
                                        "
                                    >

                                        <option value="">

                                            {loadingQuestionSets
                                                ? "Loading question sets..."
                                                : "Select question set"}

                                        </option>


                                        {questionSets.map(
                                            (
                                                set
                                            ) => (

                                                <option
                                                    key={
                                                        set.id
                                                    }
                                                    value={
                                                        set.id
                                                    }
                                                >
                                                    {set.name}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            )}


                            {/* INTERVIEW FORMAT */}

                            <div className="
                                mt-6
                            ">

                                <InterviewFormat
                                    value={
                                        format
                                    }
                                    onChange={
                                        setFormat
                                    }
                                />

                            </div>


                            {/* DOCUMENT UPLOAD */}

                            <div className="
                                mt-6
                            ">

                                <DocumentUpload
                                    onFileChange={
                                        setFile
                                    }
                                />

                            </div>


                            {/* UPLOADED FILE */}

                            {file && (

                                <div className="
                                    mt-4
                                ">

                                    <UploadedFile
                                        file={
                                            file
                                        }
                                    />

                                </div>

                            )}


                            {/* CONTINUE */}

                            <div className="
                                mt-6
                                border-t
                                border-slate-100
                                pt-5
                                dark:border-slate-800
                            ">

                                <ContinueButton

                                    universityId={
                                        selectedUniversity
                                    }

                                    courseId={
                                        selectedCourse
                                    }

                                    questionSetId={
                                        selectedQuestionSet
                                    }

                                    format={
                                        format
                                    }

                                    file={
                                        file
                                    }

                                />

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}


export default SetupInterview;