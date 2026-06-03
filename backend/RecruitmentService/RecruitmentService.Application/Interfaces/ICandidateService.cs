using RecruitmentService.Application.DTOs;

namespace RecruitmentService.Application.Interfaces;

public interface ICandidateService
{
    Task<IEnumerable<CandidateApplicationDto>> GetApplicationsByJobAsync(int jobId);
    Task<CandidateApplicationDto?> GetApplicationByIdAsync(int id);
    Task<CandidateApplicationDto> CreateApplicationAsync(CreateApplicationDto dto, string resumeFilePath, string resumeText);
    Task<CandidateApplicationDto> UpdateApplicationStatusAsync(int id, UpdateApplicationStatusDto dto);
    Task SaveAIScreeningResultAsync(int applicationId, int score, string analysis);
    Task SaveInterviewQuestionsAsync(int applicationId, string questionsJson);
    Task SaveAnswerEvaluationAsync(int applicationId, string evaluationJson);
    Task<IEnumerable<CandidateApplicationDto>> GetRankedCandidatesAsync(int jobId);
}
