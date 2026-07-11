import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import api from '../../api/axios';
import { clearUploadJob } from '../../store/slices/uploadSlice';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';

const FloatingUploadManager = () => {
    const dispatch = useDispatch();
    const uppyRef = useRef(null);
    const successfulUploadsRef = useRef([]);

    // ✨ NEW: Keep track of the dynamic upload type for safe event cleanup
    const activeUploadTypeRef = useRef(null);

    useEffect(() => {
        const handleCancel = () => {
            if (uppyRef.current) {
                uppyRef.current.cancelAll();
                uppyRef.current.destroy();
                uppyRef.current = null;
            }
            // Safely remove the specific cancel listener
            if (activeUploadTypeRef.current) {
                window.removeEventListener(`${activeUploadTypeRef.current}-upload-cancel`, handleCancel);
                activeUploadTypeRef.current = null;
            }
            dispatch(clearUploadJob());
        };

        const handleBackgroundUploadInitiation = async (e) => {
            if (uppyRef.current) return;

            const { files, metadata, uploadType } = e.detail;
            successfulUploadsRef.current = [];

            // ✨ Bind the active type and attach the dynamic listener
            activeUploadTypeRef.current = uploadType;
            window.addEventListener(`${uploadType}-upload-cancel`, handleCancel);

            const uppy = new Uppy({
                autoProceed: true,
                allowMultipleUploadBatches: false,
            });

            uppy.use(AwsS3, {
                limit: 3,
                timeout: 60 * 1000,
                shouldUseMultipart: (file) => file.size > 5 * 1024 * 1024,

                getUploadParameters: async (file) => {
                    const endpoint = uploadType === 'gallery' ? '/gallery/upload/sign' : '/employee/media/upload/sign';
                    const res = await api.post(endpoint, {
                        filename: file.name,
                        type: file.type,
                        metadata: metadata
                    });

                    uppy.setFileMeta(file.id, { publicUrl: res.data.publicUrl });

                    return {
                        method: 'PUT',
                        url: res.data.url,
                        headers: { 'Content-Type': file.type }
                    };
                },

                createMultipartUpload: async (file) => {
                    const endpoint = uploadType === 'gallery' ? '/gallery/multipart/create' : '/employee/media/multipart/create';
                    const res = await api.post(endpoint, {
                        filename: file.name,
                        type: file.type,
                        metadata: metadata
                    });
                    return { uploadId: res.data.uploadId, key: res.data.key };
                },
                signPart: async (file, partData) => {
                    const endpoint = uploadType === 'gallery' ? '/gallery/multipart/sign' : '/employee/media/multipart/sign';
                    const res = await api.post(endpoint, { uploadId: partData.uploadId, key: partData.key, partNumber: partData.partNumber });
                    return { url: res.data.url };
                },
                completeMultipartUpload: async (file, uploadData) => {
                    const endpoint = uploadType === 'gallery' ? '/gallery/multipart/complete' : '/employee/media/multipart/complete';
                    const res = await api.post(endpoint, { uploadId: uploadData.uploadId, key: uploadData.key, parts: uploadData.parts });
                    return { location: res.data.location };
                },
                abortMultipartUpload: async (file, uploadData) => {
                    const endpoint = uploadType === 'gallery' ? '/gallery/multipart/abort' : '/employee/media/multipart/abort';
                    await api.post(endpoint, { uploadId: uploadData.uploadId, key: uploadData.key });
                }
            });

            uppy.on('upload-progress', (file, progressData) => {
                const percent = Math.round((progressData.bytesUploaded / progressData.bytesTotal) * 100);
                const eventName = `${uploadType}-upload-progress`;
                window.dispatchEvent(new CustomEvent(eventName, { detail: percent }));
            });

            uppy.on('upload-success', (file, response) => {
                successfulUploadsRef.current.push({
                    url: file.meta.publicUrl || response.uploadURL,
                    fileType: file.type.startsWith('video/') ? 'video' : 'image'
                });
            });

            uppy.on('complete', async (result) => {
                if (result.failed.length > 0) {
                    window.dispatchEvent(new CustomEvent(`${uploadType}-upload-error`, { detail: "Upload failed." }));
                } else {
                    try {
                        if (uploadType === 'gallery') {
                            await api.post('/gallery/save-log', {
                                ...metadata,
                                mediaUrl: successfulUploadsRef.current[0].url,
                                fileType: successfulUploadsRef.current[0].fileType
                            });
                            window.dispatchEvent(new Event('refreshGalleryFeed'));
                        } else {
                            await api.post('/employee/media/save-log', {
                                ...metadata,
                                uploadedFiles: successfulUploadsRef.current
                            });
                            window.dispatchEvent(new Event('refreshMediaGallery'));
                        }
                        window.dispatchEvent(new CustomEvent(`${uploadType}-upload-success`));
                    } catch (err) {
                        window.dispatchEvent(new CustomEvent(`${uploadType}-upload-error`, { detail: "Database save failed." }));
                    }
                }

                // Cleanup after upload finishes (success or fail)
                if (activeUploadTypeRef.current) {
                    window.removeEventListener(`${activeUploadTypeRef.current}-upload-cancel`, handleCancel);
                    activeUploadTypeRef.current = null;
                }
                uppyRef.current = null;
                dispatch(clearUploadJob());
            });

            files.forEach(file => uppy.addFile({ name: file.name, type: file.type, data: file }));
            uppyRef.current = uppy;
        };

        window.addEventListener('initiateGlobalBackgroundUploadJob', handleBackgroundUploadInitiation);

        return () => {
            window.removeEventListener('initiateGlobalBackgroundUploadJob', handleBackgroundUploadInitiation);
            // Catch-all cleanup if component unmounts mid-upload
            if (activeUploadTypeRef.current) {
                window.removeEventListener(`${activeUploadTypeRef.current}-upload-cancel`, handleCancel);
            }
            if (uppyRef.current) uppyRef.current.destroy();
        };
    }, [dispatch]);

    return null;
};

export default FloatingUploadManager;