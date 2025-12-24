package com.example.taskask.service;

import com.example.taskask.dto.AddTeamMemberRequest;
import com.example.taskask.dto.CreateTeamRequest;
import com.example.taskask.dto.TeamMemberResponse;
import com.example.taskask.dto.TeamResponse;
import com.example.taskask.entity.Team;
import com.example.taskask.entity.TeamMember;
import com.example.taskask.entity.TeamMemberId;
import com.example.taskask.entity.User;
import com.example.taskask.enums.Role;
import com.example.taskask.repository.TeamMemberRepository;
import com.example.taskask.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserService userService;

    /**
     * Creates a new team led by the given user (must be TEAM_LEAD).
     */
    public Team createTeam(CreateTeamRequest request, Long leadUserId) {
        User lead = userService.getUserOrThrow(leadUserId);
        if (lead.getRole() != Role.TEAM_LEAD) {
            throw new ResponseStatusException(BAD_REQUEST, "Only TEAM_LEAD can create teams");
        }

        // Ensure lead doesn't already own a team
        teamRepository.findByLeadId(leadUserId).ifPresent(t -> {
            throw new ResponseStatusException(BAD_REQUEST, "Lead already has a team");
        });

        Team team = Team.builder()
                .name(request.name())
                .lead(lead)
                .build();
        return teamRepository.save(team);
    }

    /**
     * Add an employee to the lead's team (one team per user enforced).
     */
    public void addMember(Long teamId, AddTeamMemberRequest req, Long leadUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Team not found"));

        // Ensure caller is the lead of this team
        if (!team.getLead().getId().equals(leadUserId)) {
            throw new ResponseStatusException(BAD_REQUEST, "Only the team lead can add members to this team");
        }

        User user = userService.getUserOrThrow(req.userId());
        if (user.getRole() != Role.EMPLOYEE) {
            throw new ResponseStatusException(BAD_REQUEST, "Only EMPLOYEE users can be added to a team");
        }

        // Enforce one team per user
        teamMemberRepository.findByUserId(user.getId()).ifPresent(tm -> {
            throw new ResponseStatusException(BAD_REQUEST, "User already belongs to a team");
        });

        TeamMember member = TeamMember.builder()
                .id(new TeamMemberId(team.getId(), user.getId()))
                .team(team)
                .user(user)
                .build();
        teamMemberRepository.save(member);
    }

    /**
     * List members of the lead's own team.
     */
    public List<TeamMemberResponse> getMyTeamMembers(Long leadUserId) {
        Team team = teamRepository.findByLeadId(leadUserId)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "No team found for this lead"));

        return teamMemberRepository.findByTeamId(team.getId()).stream()
                .map(tm -> new TeamMemberResponse(
                        tm.getUser().getId(),
                        tm.getUser().getFullName(),
                        tm.getUser().getEmail()
                ))
                .toList();
    }

    public Team getTeamByLead(Long leadUserId) {
        return teamRepository.findByLeadId(leadUserId)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "No team found for this lead"));
    }

    /**
     * Get all teams (for admin view).
     */
    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(team -> new TeamResponse(
                        team.getId(),
                        team.getName(),
                        team.getLead().getId(),
                        team.getLead().getFullName(),
                        team.getLead().getEmail()
                ))
                .toList();
    }
}
