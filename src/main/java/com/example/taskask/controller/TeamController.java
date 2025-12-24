package com.example.taskask.controller;

import com.example.taskask.dto.AddTeamMemberRequest;
import com.example.taskask.dto.CreateTeamRequest;
import com.example.taskask.dto.TeamMemberResponse;
import com.example.taskask.entity.Team;
import com.example.taskask.service.TeamService;
import com.example.taskask.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;
    private final UserService userService;

    // Create a team (TEAM_LEAD only) - lead is inferred from authenticated user
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    @PostMapping
    public Team createTeam(@RequestBody CreateTeamRequest request, Principal principal) {
        Long leadId = getUserId(principal);
        return teamService.createTeam(request, leadId);
    }

    // Add a member (employee) to the lead's own team
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    @PostMapping("/{teamId}/members")
    public void addMember(@PathVariable Long teamId,
                          @RequestBody AddTeamMemberRequest request,
                          Principal principal) {
        Long leadId = getUserId(principal);
        teamService.addMember(teamId, request, leadId);
    }

    // List members of the lead's own team
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    @GetMapping("/mine/members")
    public List<TeamMemberResponse> myTeamMembers(Principal principal) {
        Long leadId = getUserId(principal);
        return teamService.getMyTeamMembers(leadId);
    }

    // Get the team owned by the authenticated lead (useful for UI state)
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    @GetMapping("/mine")
    public Team myTeam(Principal principal) {
        Long leadId = getUserId(principal);
        return teamService.getTeamByLead(leadId);
    }

    // Utility: principal name is the email; fetch user id via UserService
    private Long getUserId(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new IllegalArgumentException("No authenticated user");
        }
        return userService.getByEmailOrThrow(principal.getName()).getId();
    }
}
